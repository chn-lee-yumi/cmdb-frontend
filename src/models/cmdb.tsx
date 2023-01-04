import { useState } from 'react';

export default () => {
  const [projectList, setProjectList] = useState<{ value: string; label: string }[]>([]);
  const [currentProject, setCurrentProject] = useState('');
  const [machineData, setMachineData] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [groupData, setGroupData] = useState<any[]>([]);
  return {
    projectList,
    setProjectList,
    currentProject,
    setCurrentProject,
    machineData,
    setMachineData,
    roleData,
    setRoleData,
    groupData,
    setGroupData,
  };
};
