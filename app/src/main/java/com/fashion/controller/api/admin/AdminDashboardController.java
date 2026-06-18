package com.fashion.controller.api.admin;

import com.fashion.dto.response.DashboardResponseDTO;
import com.fashion.dto.response.RevenueReturnChartDTO;
import com.fashion.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponseDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }
    @GetMapping("/revenue-return")
    public ResponseEntity<List<RevenueReturnChartDTO>> getRevenueAndReturnChart(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate
    ) {
        return ResponseEntity.ok(dashboardService.getRevenueAndReturnRateChart(startDate, endDate));
    }
}
