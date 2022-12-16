import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApexChart, ApexNonAxisChartSeries } from 'ng-apexcharts/public_api';
import { Employee } from 'src/app/models/employee';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-show-data',
  templateUrl: './show-data.component.html',
  styleUrls: ['./show-data.component.css']
})
export class ShowDataComponent implements OnInit {

  employees: Employee[] = [];
  employeesCombined: Employee[] = [];

  editForm!: FormGroup;

  chartSeries: ApexNonAxisChartSeries;
  chartDetails: ApexChart;
  chartLabels: any;
  chartShow: boolean = false;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initData();
    this.initForm();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      employeeName: null,
      workTime: null
    })
  }

  get eForm() {
    return this.editForm.controls;
  }

  initData(): void {
    this.dataService.getData().subscribe({
      next: (data) => this.employees = data,
      error: (error) => console.error(error),
      complete: () => {
        this.combineData();
      }
    });
  }

  combineData(): void {
    this.employees.forEach((employee) => {
      var skip = true;

      this.employeesCombined.forEach((employeeInCombined) => {
        if (employee.EmployeeName === employeeInCombined.EmployeeName) {
          employeeInCombined.WorkTime === undefined ? employeeInCombined.WorkTime = 0 : employeeInCombined.WorkTime += new Date(employee.EndTimeUtc).getUTCHours() - new Date(employee.StarTimeUtc).getUTCHours();
          skip = false;
        }
      });

      if (skip && employee.EmployeeName !== null) {
        this.employeesCombined.push(employee);
      }
    })

    this.employeesCombined.sort((a, b) => b.WorkTime - a.WorkTime);
    this.initChart();
  }

  onRowEditInit(employee: Employee) {
    this.editForm?.patchValue({
      employeeName: employee.EmployeeName,
      workTime: employee.WorkTime
    });
  }

  onRowEditSave(employee: Employee) {
    this.bindInputs(employee);

    this.employeesCombined.splice(this.employeesCombined.findIndex(x => x.Id === employee.Id), 1, employee);
    this.employeesCombined.sort((a, b) => b.WorkTime - a.WorkTime);
  }

  bindInputs(employee: Employee): void {
    employee.EmployeeName = this.eForm['employeeName'].value;
    employee.WorkTime = this.eForm['workTime'].value;
  }

  checkWorkHours(workHours: number): string {
    return workHours < 100 ? 'colorRow' : '';
  }

  initChart(){
    this.chartSeries = this.employeesCombined.map(o=> o.WorkTime);
    this.chartDetails = {
      type: 'pie',
      toolbar: {
        show: true
      }
    };
    this.chartLabels = this.employeesCombined.map(o=> o.EmployeeName);
    this.chartShow = true;
  }
}
