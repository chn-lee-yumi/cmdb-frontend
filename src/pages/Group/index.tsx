import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusSquareOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  TableColumnsType,
  Tooltip,
} from 'antd';
import {
  getProjectList,
  getGroupList,
  createGroup as createNewGroup,
  modifyGroup as modifyOneGroup,
  deleteGroup as deleteOneGroup,
  modifyMachine,
  getMachineList,
  getRoleList,
} from '@/services/cmdb/api';
import { useModel } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

interface ModifyGroupFormProps {
  open: boolean;
  currentGroup: string;
  onCreate: (values: { name: string }) => void;
  onCancel: () => void;
}

interface ModifyMachineFormProps {
  open: boolean;
  currentGroup: string;
  onCreate: (values: { machine_id: number; role_id: number }) => void;
  onCancel: () => void;
}

const ModifyGroupForm: React.FC<ModifyGroupFormProps> = ({
  open,
  currentGroup,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title={'修改群组信息：' + currentGroup}
      okText="提交"
      cancelText="取消"
      onCancel={onCancel}
      destroyOnClose={true}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item name="name" label="群组名">
          <Input defaultValue={currentGroup} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ModifyMachineForm: React.FC<ModifyMachineFormProps> = ({
  open,
  currentGroup,
  onCreate,
  onCancel,
}) => {
  const { roleData, machineData } = useModel('cmdb');
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title={'将机器加入到群组：' + currentGroup}
      okText="提交"
      cancelText="取消"
      onCancel={onCancel}
      destroyOnClose={true}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item
          name="machine_id"
          label="机器"
          rules={[{ required: true, message: '请选择机器' }]}
        >
          <Select
            showSearch
            placeholder="选择机器"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={machineData.map((item) => ({ value: item.id, label: item.main_ip }))}
          />
        </Form.Item>
        <Form.Item name="role_id" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
          <Select
            showSearch
            placeholder="选择角色"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={roleData.map((item) => ({ value: item.id, label: item.name }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Group: React.FC = () => {
  const [openGroupForm, setOpenGroupForm] = useState(false);
  const [openMachineForm, setOpenMachineForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState('');
  const [groupId, setGroupId] = useState(0);
  const {
    currentProject,
    groupData,
    roleData,
    machineData,
    setMachineData,
    setRoleData,
    setGroupData,
  } = useModel('cmdb');

  const columns: ColumnsType<CMDB.Group> = [
    {
      title: '群组名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="将机器绑定角色和群组">
            <Button
              type="dashed"
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={() => {
                setCurrentGroup(record.name);
                setGroupId(record.id);
                setOpenMachineForm(true);
              }}
            ></Button>
          </Tooltip>
          <Tooltip title="修改群组">
            <Button
              type="dashed"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentGroup(record.name);
                setGroupId(record.id);
                setOpenGroupForm(true);
              }}
            ></Button>
          </Tooltip>
          <Tooltip title="删除群组">
            <Button
              type="dashed"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={async () => {
                try {
                  const msg = await deleteOneGroup(record);
                  console.log(msg);
                  const data = await getGroupList(record.project);
                  setGroupData(data.map((item) => ({ ...item, key: item.id })));
                } catch (error) {
                  console.log(error);
                }
              }}
            ></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: CMDB.Group) => {
    const columns: TableColumnsType<CMDB.Machine> = [
      {
        title: '角色',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a.role - b.role,
        dataIndex: 'role_name',
        key: 'role_name',
      },
      { title: '机器IP', sorter: (a, b) => a.id - b.id, dataIndex: 'main_ip', key: 'main_ip' },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (_, record) => (
          <Space wrap>
            <Tooltip title="从群组中移除机器">
              <Button
                type="dashed"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={async () => {
                  try {
                    const msg = await modifyMachine({
                      id: record.id,
                      group: null,
                      role: null,
                      currentProject: currentProject,
                    });
                    console.log(msg);
                    const data = await getMachineList(currentProject);
                    setMachineData(data);
                  } catch (error) {
                    console.log(error);
                  }
                }}
              ></Button>
            </Tooltip>
          </Space>
        ),
      },
    ];

    // TODO: 优化性能
    const roleMap: { [key: number]: CMDB.Role } = {};
    for (let i = 0; i < roleData.length; ++i) {
      roleMap[roleData[i].id] = roleData[i];
    }
    const data = [];
    for (let i = 0; i < machineData.length; ++i) {
      if (machineData[i].group === record.id) {
        data.push({
          ...machineData[i],
          role_name: roleMap[machineData[i].role].name,
          key: machineData[i].id,
        });
      }
    }
    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const createGroup = async (values: CMDB.Group) => {
    try {
      const msg = await createNewGroup({ ...values, project: currentProject });
      console.log(msg);
      const data = await getGroupList(currentProject);
      setGroupData(data.map((item) => ({ ...item, key: item.id })));
    } catch (error) {
      console.log(error);
    }
  };

  const modifyGroup = async (id: number, name: string) => {
    try {
      const msg = await modifyOneGroup({
        id: id,
        name: name,
        project: currentProject,
      });
      console.log(msg);
      const data = await getGroupList(currentProject);
      setGroupData(data.map((item) => ({ ...item, key: item.id })));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      let project = currentProject;
      if (project === '') {
        const projects = await getProjectList();
        project = projects[0].name;
      }
      const roleData = await getRoleList(project);
      setRoleData(roleData.map((item) => ({ ...item, key: item.id })));
      const machineData = await getMachineList(project);
      setMachineData(machineData);
      const groupData = await getGroupList(project);
      setGroupData(groupData.map((item) => ({ ...item, key: item.id })));
    })();
  }, []);

  const onCreateModifyGroup = (values: any) => {
    console.log('Received values of form: ', values);
    modifyGroup(groupId, values.name);
    setOpenGroupForm(false);
  };

  const onCreateModifyMachine = async (values: { machine_id: number; role_id: number }) => {
    console.log('Received values of form: ', values);
    const msg = await modifyMachine({
      id: values.machine_id,
      group: groupId,
      role: values.role_id,
      currentProject: currentProject,
    });
    console.log(msg);
    const data = await getMachineList(currentProject);
    setMachineData(data);
    setOpenMachineForm(false);
  };

  return (
    <div>
      <ModifyGroupForm
        open={openGroupForm}
        currentGroup={currentGroup}
        onCreate={onCreateModifyGroup}
        onCancel={() => {
          setOpenGroupForm(false);
        }}
      />
      <ModifyMachineForm
        open={openMachineForm}
        currentGroup={currentGroup}
        onCreate={onCreateModifyMachine}
        onCancel={() => {
          setOpenMachineForm(false);
        }}
      />
      <Card>
        <Form
          layout="inline"
          onFinish={async (values) => {
            await createGroup(values as CMDB.Group);
          }}
        >
          <Form.Item
            label="群组名"
            name="name"
            rules={[{ required: true, message: '请填入群组名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              新增群组
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Table columns={columns} dataSource={groupData} expandable={{ expandedRowRender }} />
    </div>
  );
};

export default Group;
