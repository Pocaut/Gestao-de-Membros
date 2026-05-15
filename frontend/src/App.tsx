import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  Check,
  ClipboardList,
  LockKeyhole,
  LogOut,
  Search,
  UserPlus,
} from 'lucide-react';

import { AuthResponse, login } from './api/auth';
import { ApiError, Member, createMember, fetchMembers, updateMemberStatus } from './api/members';
import { cpfDigits, formatCpf, isValidCpf } from './utils/cpf';

type Route = 'home' | 'register' | 'members';
type FieldErrors = Partial<Record<'fullName' | 'birthDate' | 'cpf' | 'form', string>>;
type SortKey = keyof Pick<Member, 'fullName' | 'age' | 'cpf'>;
type SortDirection = 'asc' | 'desc';

const routeByHash: Record<string, Route> = {
  '#/cadastro': 'register',
  '#/membros': 'members',
};
const TOKEN_STORAGE_KEY = 'members_management_token';

function App() {
  const [route, setRoute] = useState<Route>(() => routeByHash[window.location.hash] ?? 'home');
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? '');

  useEffect(() => {
    const handleHashChange = () => setRoute(routeByHash[window.location.hash] ?? 'home');

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function navigate(nextRoute: Route) {
    const hash = nextRoute === 'home' ? '#/' : nextRoute === 'register' ? '#/cadastro' : '#/membros';
    window.location.hash = hash;
    setRoute(nextRoute);
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    navigate('home');
  }

  function handleLogin(response: AuthResponse) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setAuthToken(response.token);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken('');
    navigate('home');
  }

  if (!authToken) {
    return (
      <main className="app-shell">
        <LoginPage onLogin={handleLogin} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <nav className="topbar authenticated-topbar" aria-label="Navegação principal">
        <button className="brand-button" onClick={() => navigate('home')} type="button">
          <span>Gestão de Membros</span>
        </button>
        <button className="ghost-button" onClick={logout} type="button">
          <LogOut size={18} aria-hidden="true" />
          Sair
        </button>
      </nav>

      {route === 'home' && <HomePage onNavigate={navigate} />}
      {route === 'register' && <RegisterPage onBack={goBack} token={authToken} />}
      {route === 'members' && <MembersPage onBack={goBack} onNavigate={navigate} token={authToken} />}
    </main>
  );
}

function LoginPage({ onLogin }: { onLogin: (response: AuthResponse) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Informe usuário e senha.');
      return;
    }

    setIsSubmitting(true);

    try {
      onLogin(await login({ username: username.trim(), password }));
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message ?? 'Não foi possível autenticar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="content-panel narrow-panel login-panel">
      <div className="section-heading">
        <p className="eyebrow">Acesso</p>
        <h2>Gestão de Membros</h2>
      </div>

      <form className="member-form" onSubmit={handleSubmit} noValidate>
        <FieldError message={error} />

        <label className="field-group">
          <span>Usuário</span>
          <input
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
            type="text"
            value={username}
          />
        </label>

        <label className="field-group">
          <span>Senha</span>
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        <button className="primary-button full-width" disabled={isSubmitting} type="submit">
          <LockKeyhole size={20} aria-hidden="true" />
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}

function HomePage({ onNavigate }: { onNavigate: (route: Route) => void }) {
  return (
    <section className="landing-panel">
      <div className="landing-copy">
        <h1>Gestão de Membros</h1>
        <div className="landing-actions">
          <button className="primary-button" onClick={() => onNavigate('register')} type="button">
            <UserPlus size={20} aria-hidden="true" />
            Cadastro
          </button>
          <button className="secondary-button" onClick={() => onNavigate('members')} type="button">
            <ClipboardList size={20} aria-hidden="true" />
            Lista de Membros
          </button>
        </div>
      </div>
    </section>
  );
}

function RegisterPage({ onBack, token }: { onBack: () => void; token: string }) {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage('');

    const nextErrors = validateForm({ fullName, birthDate, cpf });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await createMember(
        {
          fullName: fullName.trim(),
          birthDate,
          cpf: cpfDigits(cpf),
          active,
        },
        token,
      );

      setFullName('');
      setBirthDate('');
      setCpf('');
      setActive(true);
      setSuccessMessage('Membro cadastrado com sucesso.');
    } catch (error) {
      const apiError = error as ApiError;
      setErrors({
        form: apiError.message,
        ...(apiError.fieldErrors ?? {}),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="content-panel narrow-panel">
      <div className="section-heading">
        <BackButton onClick={onBack} />
        <p className="eyebrow">Cadastro</p>
        <h2>Novo membro</h2>
      </div>

      <form className="member-form" onSubmit={handleSubmit} noValidate>
        <FieldError message={errors.form} />

        <label className="field-group">
          <span>Nome Completo</span>
          <input
            autoComplete="name"
            className={errors.fullName ? 'invalid' : ''}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ex.: Ana Beatriz Souza"
            type="text"
            value={fullName}
          />
          <FieldError message={errors.fullName} />
        </label>

        <label className="field-group">
          <span>Idade</span>
          <input
            className={errors.birthDate ? 'invalid' : ''}
            max={todayAsInputValue()}
            onChange={(event) => setBirthDate(event.target.value)}
            onInput={(event) => setBirthDate(event.currentTarget.value)}
            type="date"
            value={birthDate}
          />
          {birthDate && !errors.birthDate && (
            <span className="age-preview">Idade calculada: {calculateAge(birthDate)} anos</span>
          )}
          <FieldError message={errors.birthDate} />
        </label>

        <label className="field-group">
          <span>CPF</span>
          <input
            autoComplete="off"
            className={errors.cpf ? 'invalid' : ''}
            inputMode="numeric"
            onChange={(event) => setCpf(formatCpf(event.target.value))}
            placeholder="000.000.000-00"
            type="text"
            value={cpf}
          />
          <FieldError message={errors.cpf} />
        </label>

        <label className="switch-row">
          <span>Ativo</span>
          <button
            aria-pressed={active}
            className={`toggle-button ${active ? 'enabled' : ''}`}
            onClick={() => setActive((current) => !current)}
            type="button"
          >
            <span className="toggle-knob" />
          </button>
        </label>

        {successMessage && (
          <div className="success-message" role="status">
            <Check size={18} aria-hidden="true" />
            {successMessage}
          </div>
        )}

        <button className="primary-button full-width" disabled={isSubmitting} type="submit">
          <Check size={20} aria-hidden="true" />
          {isSubmitting ? 'Salvando...' : 'Confirmar'}
        </button>
      </form>
    </section>
  );
}

function MembersPage({
  onBack,
  onNavigate,
  token,
}: {
  onBack: () => void;
  onNavigate: (route: Route) => void;
  token: string;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusTarget, setStatusTarget] = useState<Member | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [filters, setFilters] = useState({ fullName: '', cpf: '', age: '' });
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'fullName',
    direction: 'asc',
  });

  useEffect(() => {
    fetchMembers(token)
      .then((data) => {
        setMembers(data);
        setLoadError('');
      })
      .catch(() => setLoadError('Não foi possível carregar a lista de membros.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const visibleMembers = useMemo(() => {
    return members
      .filter((member) => member.fullName.toLowerCase().includes(filters.fullName.toLowerCase()))
      .filter((member) => formatCpf(member.cpf).includes(filters.cpf))
      .filter((member) => !filters.age || String(member.age).includes(filters.age))
      .sort((first, second) => compareMembers(first, second, sort.key, sort.direction));
  }, [filters, members, sort]);

  function handleSort(key: SortKey) {
    setSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      return { key, direction: key === 'age' ? 'desc' : 'asc' };
    });
  }

  async function confirmStatusChange() {
    if (!statusTarget) {
      return;
    }

    setIsUpdatingStatus(true);
    setStatusError('');

    try {
      const updatedMember = await updateMemberStatus(statusTarget.id, !statusTarget.active, token);
      setMembers((currentMembers) =>
        currentMembers.map((member) => (member.id === updatedMember.id ? updatedMember : member)),
      );
      setStatusTarget(null);
    } catch {
      setStatusError('Não foi possível alterar o status do membro.');
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <section className="content-panel wide-panel">
        <BackButton onClick={onBack} />
        <div className="empty-state compact-empty">Carregando membros...</div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="content-panel wide-panel">
        <BackButton onClick={onBack} />
        <div className="empty-state compact-empty">{loadError}</div>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section className="content-panel wide-panel">
        <BackButton onClick={onBack} />
        <div className="empty-state compact-empty">
          <ClipboardList size={44} aria-hidden="true" />
          <h2>Não há membros cadastrados</h2>
          <p>A lista de membros aparecerá aqui depois do primeiro cadastro.</p>
          <button className="primary-button" onClick={() => onNavigate('register')} type="button">
            <UserPlus size={20} aria-hidden="true" />
            Cadastre seu primeiro Membro!
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="content-panel wide-panel">
      <div className="section-heading inline-heading">
        <div>
          <BackButton onClick={onBack} />
          <p className="eyebrow">Lista</p>
          <h2>Membros</h2>
        </div>
        <span className="count-pill">{visibleMembers.length} membro(s)</span>
      </div>

      <FieldError message={statusError} />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortableHeader
                active={sort.key === 'fullName'}
                direction={sort.direction}
                label="Nome Completo"
                onClick={() => handleSort('fullName')}
                type="text"
              />
              <SortableHeader
                active={sort.key === 'age'}
                direction={sort.direction}
                label="Idade"
                onClick={() => handleSort('age')}
                type="number"
              />
              <SortableHeader
                active={sort.key === 'cpf'}
                direction={sort.direction}
                label="CPF"
                onClick={() => handleSort('cpf')}
                type="text"
              />
              <th>Status</th>
            </tr>
            <tr className="filter-row">
              <th>
                <FilterInput
                  onChange={(value) => setFilters((current) => ({ ...current, fullName: value }))}
                  placeholder="Filtrar nome"
                  value={filters.fullName}
                />
              </th>
              <th>
                <FilterInput
                  onChange={(value) =>
                    setFilters((current) => ({ ...current, age: value.replace(/\D/g, '') }))
                  }
                  placeholder="Idade"
                  value={filters.age}
                />
              </th>
              <th>
                <FilterInput
                  onChange={(value) => setFilters((current) => ({ ...current, cpf: formatCpf(value) }))}
                  placeholder="Filtrar CPF"
                  value={filters.cpf}
                />
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleMembers.length === 0 ? (
              <tr>
                <td className="no-results" colSpan={4}>
                  Nenhum membro encontrado com estes filtros.
                </td>
              </tr>
            ) : (
              visibleMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.fullName}</td>
                  <td>{member.age}</td>
                  <td>{formatCpf(member.cpf)}</td>
                  <td>
                    <button
                      className={`status-button ${member.active ? 'active' : 'inactive'}`}
                      onClick={() => setStatusTarget(member)}
                      type="button"
                    >
                      {member.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {statusTarget && (
        <div className="modal-backdrop" role="presentation">
          <div aria-modal="true" className="modal-dialog" role="dialog">
            <h3>Alterar status do Membro?</h3>
            <p>
              O membro será marcado como {statusTarget.active ? 'Inativo' : 'Ativo'}.
            </p>
            <div className="modal-actions">
              <button
                className="secondary-button"
                disabled={isUpdatingStatus}
                onClick={() => setStatusTarget(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="primary-button"
                disabled={isUpdatingStatus}
                onClick={confirmStatusChange}
                type="button"
              >
                {isUpdatingStatus ? 'Alterando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <span className="field-error" role="alert">
      {message}
    </span>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="Voltar" className="back-button" onClick={onClick} title="Voltar" type="button">
      <ArrowLeft size={22} aria-hidden="true" />
    </button>
  );
}

function FilterInput({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="filter-input">
      <Search size={15} aria-hidden="true" />
      <input onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
    </label>
  );
}

function SortableHeader({
  active,
  direction,
  label,
  onClick,
  type,
}: {
  active: boolean;
  direction: SortDirection;
  label: string;
  onClick: () => void;
  type: 'text' | 'number';
}) {
  const Icon = type === 'number' ? ArrowDownWideNarrow : direction === 'asc' ? ArrowDownAZ : ArrowUpAZ;

  return (
    <th>
      <button className={`sort-button ${active ? 'active' : ''}`} onClick={onClick} type="button">
        {label}
        <Icon size={16} aria-hidden="true" />
      </button>
    </th>
  );
}

function validateForm({
  fullName,
  birthDate,
  cpf,
}: {
  fullName: string;
  birthDate: string;
  cpf: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!fullName.trim()) {
    errors.fullName = 'Informe o nome completo.';
  }

  if (!birthDate) {
    errors.birthDate = 'Informe a data de nascimento.';
  } else if (new Date(`${birthDate}T00:00:00`) > new Date()) {
    errors.birthDate = 'A data de nascimento não pode estar no futuro.';
  } else if (calculateAge(birthDate) < 18) {
    errors.birthDate = 'Membros menores de 18 anos não podem ser cadastrados.';
  }

  if (!cpfDigits(cpf)) {
    errors.cpf = 'Informe o CPF.';
  } else if (!isValidCpf(cpf)) {
    errors.cpf = 'CPF inválido.';
  }

  return errors;
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const date = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
}

function todayAsInputValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${today.getFullYear()}-${month}-${day}`;
}

function compareMembers(first: Member, second: Member, key: SortKey, direction: SortDirection) {
  const multiplier = direction === 'asc' ? 1 : -1;

  if (key === 'age') {
    return (first.age - second.age) * multiplier;
  }

  return first[key].localeCompare(second[key], 'pt-BR', { sensitivity: 'base' }) * multiplier;
}

export default App;
