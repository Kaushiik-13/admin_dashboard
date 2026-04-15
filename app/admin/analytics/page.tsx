"use client";

import { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import HorizontalBar from "../../components/HorizontalBar";
import { apiGet } from "../../lib/api";

const topCities = [
  { name: "Chennai", flag: "🏙️", users: "4,820", color: "#2d6a4f" },
  { name: "Coimbatore", flag: "🏙️", users: "2,140", color: "#3b82f6" },
  { name: "Madurai", flag: "🏙️", users: "1,380", color: "#f59e0b" },
  { name: "Bangalore", flag: "🏙️", users: "980", color: "#ef4444" },
];

const skillColors = ["#2d6a4f", "#ef4444", "#3b82f6", "#6366f1", "#f59e0b", "#14b8a6", "#ec4899", "#8b5cf6"];

export default function AnalyticsPage() {
  const [jobCategories, setJobCategories] = useState<{ label: string; percentage: number; color: string }[]>([]);
  const [statsData, setStatsData] = useState({
    jobsCompleted: 0,
    activeJobs: 0,
    pendingModerations: 0,
    topCity: "...",
    topCityPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiGet<any[]>("/admin/dashboard/skills-stats");
        if (Array.isArray(res)) {
          const total = res.reduce((sum, item) => sum + (item.count || 0), 0);
          if (total > 0) {
            const sorted = res.sort((a, b) => b.count - a.count).slice(0, 5);
            const mapped = sorted.map((item, idx) => ({
              label: item.skill_name || "Unknown",
              percentage: Math.round((item.count / total) * 100),
              color: skillColors[idx % skillColors.length],
            }));
            setJobCategories(mapped);
          } else {
            setJobCategories([]);
          }
        }

        // Fetch Overall Stats
        const [
          workersRes,
          activeJobsRes,
          pendingWorkersRes,
          pendingEmployersRes,
          pendingJobsRes,
          allJobsRes
        ] = await Promise.all([
          apiGet<any[]>("/workers").catch(() => []),
          apiGet<any>("/listings/admin/approved").catch(() => []),
          apiGet<any>("/admin/workers/pending").catch(() => ({count:0})),
          apiGet<any>("/admin/employers/pending").catch(() => ({count:0})),
          apiGet<any>("/listings/admin/pending").catch(() => ({count:0})),
          apiGet<any[]>("/listings").catch(() => [])
        ]);

        const getCount = (r: any) => typeof r?.count === "number" ? r.count : (Array.isArray(r?.data) ? r.data.length : (Array.isArray(r) ? r.length : 0));

        // 1. Total Jobs Completed
        const jobsCompleted = Array.isArray(workersRes) ? workersRes.reduce((sum, w) => sum + (w.completed_jobs || 0), 0) : 0;

        // 2. Active Jobs
        const activeJobs = getCount(activeJobsRes);

        // 3. Pending Moderations
        const pendingModerations = getCount(pendingWorkersRes) + getCount(pendingEmployersRes) + getCount(pendingJobsRes);

        // 4. Top City
        let topCity = "N/A";
        let topCityPercentage = 0;
        let jobListings = Array.isArray(allJobsRes) ? allJobsRes : (allJobsRes?.data || []);
        if (Array.isArray(jobListings) && jobListings.length > 0) {
           const cityCounts: Record<string, number> = {};
           jobListings.forEach((job: any) => {
             const city = job.location || job.city || job.employer_id?.user_id?.addresses?.[0]?.city || "Unknown";
             if (city !== "Unknown") {
                 cityCounts[city] = (cityCounts[city] || 0) + 1;
             }
           });
           
           let maxCount = 0;
           for (const [c, count] of Object.entries(cityCounts)) {
              if (count > maxCount) {
                 maxCount = count;
                 topCity = c;
              }
           }
           if (maxCount > 0) {
              topCityPercentage = Math.round((maxCount / jobListings.length) * 100);
           }
        }

        setStatsData({ jobsCompleted, activeJobs, pendingModerations, topCity, topCityPercentage });

      } catch (err) {
        console.error("Failed to fetch skills stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          Platform Analytics
        </h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL JOBS COMPLETED"
          value={isLoading ? "..." : statsData.jobsCompleted.toString()}
          subtitle="Completed by verified providers"
          subtitleColor="#6b7280"
        />
        <StatCard
          title="ACTIVE JOBS"
          value={isLoading ? "..." : statsData.activeJobs.toString()}
          subtitle="Live matching opportunities"
          subtitleColor="#6b7280"
        />
        <StatCard
          title="ACTION REQUIRED"
          value={isLoading ? "..." : statsData.pendingModerations.toString()}
          subtitle="Profiles & jobs awaiting review"
          subtitleColor="#ea580c"
        />
        <StatCard
          title="TOP CITY"
          value={isLoading ? "..." : statsData.topCity}
          subtitle={`${statsData.topCityPercentage}% of all job posts`}
          subtitleColor="#6b7280"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: "16px" }}>
        {/* Job Categories */}
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 20px 0",
            }}
          >
            Job Categories (top 5)
          </h3>
          <HorizontalBar data={jobCategories} />
        </div>

        {/* Top Cities by Activity */}
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 20px 0",
            }}
          >
            Top Cities by Activity
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {topCities.map((city, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom:
                    idx < topCities.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{city.flag}</span>
                  {city.name}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: city.color,
                    background:
                      city.color === "#2d6a4f"
                        ? "#dcfce7"
                        : city.color === "#3b82f6"
                        ? "#dbeafe"
                        : city.color === "#f59e0b"
                        ? "#fef3c7"
                        : "#fef2f2",
                    padding: "4px 12px",
                    borderRadius: "12px",
                  }}
                >
                  {city.users} users
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
