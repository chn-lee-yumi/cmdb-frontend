import { getGroupList, getMachineList, getProjectList, getRoleList } from '@/services/cmdb/api';
import { useModel } from '@umijs/max';
import { Select } from 'antd';
import React, { useEffect } from 'react';

const HeaderContent: React.FC = () => {
  const {
    projectList,
    setProjectList,
    currentProject,
    setCurrentProject,
    setMachineData,
    setRoleData,
    setGroupData,
  } = useModel('cmdb');

  const switchProject = async (project: string) => {
    setCurrentProject(project);
    const machineData = await getMachineList(project);
    setMachineData(machineData);
    const roleData = await getRoleList(project);
    setRoleData(roleData.map((item) => ({ ...item, key: item.id })));
    const groupData = await getGroupList(project);
    setGroupData(groupData.map((item) => ({ ...item, key: item.id })));
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getProjectList();
        // console.log(data);
        if (currentProject === '') {
          setCurrentProject(data[0].name);
        }
        let list: { value: string; label: string }[] = [];
        data.forEach((e) => {
          list.push({
            value: e.name,
            label: e.name,
          });
        });
        setProjectList(list);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <Select
      value={currentProject}
      onChange={switchProject}
      style={{ width: 120 }}
      options={projectList}
    />
  );
};

export default HeaderContent;
