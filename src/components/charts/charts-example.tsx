"use client";

import { useEffect, useState } from "react";
import {
  PriceChart,
  PortfolioGrowthChart,
  AllocationChart,
  ChartWrapper,
} from "@/components/charts";
import {
  getPriceChartData,
  formatPriceDataForChart,
  getPortfolioGrowthData,
  formatPortfolioDataForChart,
  getAllocationChartData,
  formatAllocationDataForChart,
} from "@/lib/charts";
import { TimeRange } from "@/types/charts";

export function ChartsExample() {
  const [priceData, setPriceData] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [priceTimeRange, setPriceTimeRange] = useState<TimeRange>("7D");
  const [portfolioTimeRange, setPortfolioTimeRange] = useState<TimeRange>("30D");
  const [loading, setLoading] = useState({
    price: true,
    portfolio: true,
    allocation: true,
  });
  const [errors, setErrors] = useState({
    price: null as string | null,
    portfolio: null as string | null,
    allocation: null as string | null,
  });

  // Load price chart data
  useEffect(() => {
    const loadPriceData = async () => {
      try {
        setLoading(prev => ({ ...prev, price: true }));
        setErrors(prev => ({ ...prev, price: null }));

        const data = await getPriceChartData("bitcoin", priceTimeRange);
        const formattedData = formatPriceDataForChart(data.data);
        setPriceData(formattedData);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          price: error instanceof Error ? error.message : "Failed to load price data"
        }));
      } finally {
        setLoading(prev => ({ ...prev, price: false }));
      }
    };

    loadPriceData();
  }, [priceTimeRange]);

  // Load portfolio growth data
  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setLoading(prev => ({ ...prev, portfolio: true }));
        setErrors(prev => ({ ...prev, portfolio: null }));

        const data = await getPortfolioGrowthData(portfolioTimeRange);
        const formattedData = formatPortfolioDataForChart(data.data);
        setPortfolioData(formattedData);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          portfolio: error instanceof Error ? error.message : "Failed to load portfolio data"
        }));
      } finally {
        setLoading(prev => ({ ...prev, portfolio: false }));
      }
    };

    loadPortfolioData();
  }, [portfolioTimeRange]);

  // Load allocation data
  useEffect(() => {
    const loadAllocationData = async () => {
      try {
        setLoading(prev => ({ ...prev, allocation: true }));
        setErrors(prev => ({ ...prev, allocation: null }));

        const data = await getAllocationChartData();
        const formattedData = formatAllocationDataForChart(data.allocations);
        setAllocationData(formattedData);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          allocation: error instanceof Error ? error.message : "Failed to load allocation data"
        }));
      } finally {
        setLoading(prev => ({ ...prev, allocation: false }));
      }
    };

    loadAllocationData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Price Chart Example */}
      <ChartWrapper
        title="Bitcoin Price Chart"
        subtitle="Historical price data with interactive tooltips"
        timeRange={priceTimeRange}
        onTimeRangeChange={setPriceTimeRange}
        isLoading={loading.price}
        error={errors.price}
      >
        <PriceChart
          data={priceData}
          timeRange={priceTimeRange}
          isLoading={loading.price}
        />
      </ChartWrapper>

      {/* Portfolio Growth Chart Example */}
      <ChartWrapper
        title="Portfolio Growth"
        subtitle="Portfolio value over time across all holdings"
        timeRange={portfolioTimeRange}
        onTimeRangeChange={setPortfolioTimeRange}
        isLoading={loading.portfolio}
        error={errors.portfolio}
      >
        <PortfolioGrowthChart
          data={portfolioData}
          timeRange={portfolioTimeRange}
          isLoading={loading.portfolio}
        />
      </ChartWrapper>

      {/* Allocation Chart Example */}
      <ChartWrapper
        title="Portfolio Allocation"
        subtitle="Asset distribution by current value"
        isLoading={loading.allocation}
        error={errors.allocation}
      >
        <AllocationChart
          data={allocationData}
          isLoading={loading.allocation}
        />
      </ChartWrapper>
    </div>
  );
}