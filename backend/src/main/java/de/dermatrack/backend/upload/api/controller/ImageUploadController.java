package de.dermatrack.backend.upload.api.controller;

import java.security.Principal;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.upload.api.dto.ImageUploadResponse;
import de.dermatrack.backend.upload.service.ImageStorageService;
import de.dermatrack.backend.upload.service.StoredImageResource;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageStorageService imageStorageService;
    private final IAppUserRepository appUserRepository;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImage(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        AppUser currentUser = resolveCurrentUser(principal);
        ImageUploadResponse response = imageStorageService.store(currentUser.getId(), file);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getImage(
            Principal principal,
            @PathVariable String fileName) {
        AppUser currentUser = resolveCurrentUser(principal);
        StoredImageResource storedImage = imageStorageService.load(currentUser.getId(), fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(storedImage.contentType()))
                .contentLength(storedImage.contentLength())
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(storedImage.resource());
    }

    @DeleteMapping("/images/{fileName:.+}")
    public ResponseEntity<Void> deleteImage(
            Principal principal,
            @PathVariable String fileName) {
        AppUser currentUser = resolveCurrentUser(principal);
        imageStorageService.delete(currentUser.getId(), fileName);

        return ResponseEntity.noContent().build();
    }

    private AppUser resolveCurrentUser(Principal principal) {
        return appUserRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("AppUser", "username", principal.getName()));
    }
}
