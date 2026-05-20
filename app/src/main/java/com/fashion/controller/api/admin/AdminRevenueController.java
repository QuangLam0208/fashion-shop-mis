package com.fashion.controller.api.admin;

import com.fashion.dto.response.RevenueReportDTO;
import com.fashion.service.revenue.RevenueService;
import com.fashion.util.MediaTypeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminRevenueController {

    private final RevenueService revenueService;

    // XEM BÁO CÁO DOANH THU
    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportDTO> getRevenueReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate
    ) {

        RevenueReportDTO response =
                revenueService.getDetailedRevenueReport(startDate, endDate);

        return ResponseEntity.ok(response);
    }

    // XUẤT FILE BÁO CÁO DOANH THU
    @GetMapping("/revenue/export")
    public ResponseEntity<byte[]> exportRevenueReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam String format
    ) {

        byte[] fileData = revenueService.exportRevenueReport(startDate, endDate, format);

        String fileName = "revenue-report." + format;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(fileName)
                                .build()
                                .toString()
                )
                .contentType(MediaTypeUtils.getMediaTypeForFormat(format))
                .body(fileData);
    }
}
