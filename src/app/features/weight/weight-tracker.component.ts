import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-weight-tracker',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './weight-tracker.component.html',
  styleUrls: ['./weight-tracker.component.scss']
})
export class WeightTrackerComponent implements OnInit {
  isModalOpen = false;
  logs: any[] = [];

  // Chart configuration with custom styling instead of Tailwind
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Weight',
      borderColor: '#4f46e5', // Matches your --primary CSS variable
      backgroundColor: 'rgba(79, 70, 229, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHitRadius: 20
    }]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
        beginAtZero: false, // This is key! It zooms into your weight range
        grid: { display: false },
        ticks: { color: '#94a3b8' }
        },
        x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
        }
    },
    plugins: {
        legend: { display: false }
    }
    };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadLogs();
  }

  openEntryModal() {
    this.isModalOpen = true;
  }

  async saveWeight(weightValue: string) {
    const weight = parseFloat(weightValue);
    if (!isNaN(weight)) {
      const { error } = await this.supabaseService.addWeight(weight);
      if (!error) {
        this.isModalOpen = false;
        await this.loadLogs();
      } else {
        alert("Could not save: " + error.message);
      }
    }
  }

  async loadLogs() {
    const { data } = await this.supabaseService.getWeightLogs();
    if (data) {
      this.logs = data;
      this.updateChart();
    }
  }

  updateChart() {
    const sortedLogs = [...this.logs].sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
    this.lineChartData.labels = sortedLogs.map(l => new Date(l.logged_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', timeZone: 'UTC'
    }));
    this.lineChartData.datasets[0].data = sortedLogs.map(l => l.weight);
    this.lineChartData = { ...this.lineChartData }; // Force change detection
  }
}