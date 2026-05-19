package com.fashion.service.revenue;

import com.fashion.dto.response.RevenueReportDTO;

import java.util.Date;

public interface RevenueService {
    RevenueReportDTO getDetailedRevenueReport(Date startDate, Date endDate);

    // Xuất báo cáo doanh thu
    byte[] exportRevenueReport(Date startDate, Date endDate, String format);
}
