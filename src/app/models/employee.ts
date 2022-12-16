export interface Employee {
    Id: string;
    EmployeeName: string;
    StarTimeUtc: string | Date;
    EndTimeUtc: string | Date;
    EntryNotes: string;
    DeletedOn: string | Date;
    WorkTime: number;
}
