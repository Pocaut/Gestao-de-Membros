package com.example.members.member;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping
    public ResponseEntity<MemberResponse> create(@Valid @RequestBody MemberRequest request) {
        MemberResponse response = memberService.create(request);

        return ResponseEntity
                .created(URI.create("/api/members/" + response.id()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<MemberResponse>> listAll() {
        return ResponseEntity.ok(memberService.listAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<MemberResponse>> listActive() {
        return ResponseEntity.ok(memberService.listActive());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MemberResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody MemberStatusRequest request
    ) {
        return ResponseEntity.ok(memberService.updateStatus(id, request));
    }
}
