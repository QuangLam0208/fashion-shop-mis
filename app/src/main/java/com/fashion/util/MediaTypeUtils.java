package com.fashion.util;

import org.springframework.http.MediaType;

public class MediaTypeUtils {

    // Helper: xác định kiểu MIME type chuẩn cho phản hồi tải file
    public static MediaType getMediaTypeForFormat(String format) {
        return switch (format.toLowerCase()) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "excel", "xlsx" ->
                    MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case "csv" -> MediaType.TEXT_PLAIN;
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}
