package com.fashion.service.storage;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {
    String uploadFile(MultipartFile file) throws IOException;
}
