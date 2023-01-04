/* eslint-disable */
declare namespace CMDB {
    type Machine = {
        id: number;
        main_ip: string;
        group: number;
        role: number;
        project: string;
        last_heartbeat: string;
        device_system_info: DeviceSystemInfo;
        system_info: SystemInfo;
        cpu_info: CpuInfo;
        memory_info: MemoryInfo;
        load_avg: LoadAvg;
        interfaces: Interface[];
    };

    type DeviceSystemInfo = {
        manufacturer: string;
        product_name: string;
        serial_number: string;
        version: string;
    }

    type SystemInfo = {
        hostname: string;
        kernel_arch: string;
        kernel_version: string;
        os: string;
        platform: string;
        platform_version: string;
        uptime: number;
        virtualization_role: string;
    }

    type CpuInfo = {
        logical_count: number;
        physical_count: number;
        name: string;
    }

    type MemoryInfo = {
        physical_memory_total: number;
        physical_memory_used_percent: number;
        swap_memory_total: number;
        swap_memory_used_percent: number;
    }

    type LoadAvg = {
        load_1min: number;
        load_5min: number;
        load_15min: number;
    }

    type Interface = {
        IPs: string[];
        MTU: number;
        hwaddr: string;
        name: string;
    }

    type CreateMachineParam = {
        main_ip: string;
        project: string;
    }

    type DeleteMachineParam = {
        id: number;
        project: string;
    }

    type ModifyMachineParam = {
        id: number;
        main_ip?: string;
        currentProject: string;
        project?: string;
        role?: number|null;
        group?: number|null;
    }

    type Token = {
        token: string;
    }

    type Project = {
        name: string;
        description?: string;
        members: number[];
    }

    type Role = {
        id: number;
        name: string;
        project: string;
    }

    type Group = {
        id: number;
        name: string;
        project: string;
    }
}