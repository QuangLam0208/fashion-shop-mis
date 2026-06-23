package com.fashion.service.dashboard;

import com.fashion.dto.response.DashboardResponseDTO;
import com.fashion.dto.response.RevenueReturnChartDTO;

import java.util.Date;
import java.util.List;

public interface DashboardService {
    DashboardResponseDTO getDashboardData();
    List<RevenueReturnChartDTO> getRevenueAndReturnRateChart(Date startDate, Date endDate);
}
