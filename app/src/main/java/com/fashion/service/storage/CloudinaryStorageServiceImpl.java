package com.fashion.service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryStorageServiceImpl implements StorageService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Tệp tải lên không được để trống!");
        }

        // Upload file tệp tin lên thư mục fashion_shop trên Cloudinary
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "fashion_shop",
                "resource_type", "auto"
        ));

        // Trả về URL dạng HTTPS tuyệt đối được bảo mật từ Cloudinary CDN
        return uploadResult.get("secure_url").toString();
    }
}
