import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Space, Table, Tooltip } from 'antd';
import {
  getProjectList,
  getRoleList,
  createRole as createNewRole,
  modifyRole as modifyOneRole,
  deleteRole as deleteOneRole,
} from '@/services/cmdb/api';
import { useModel } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

interface ModifyRoleFormProps {
  open: boolean;
  currentRole: string;
  onCreate: (values: { name: string }) => void;
  onCancel: () => void;
}

const ModifyRoleForm: React.FC<ModifyRoleFormProps> = ({
  open,
  currentRole,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title={'修改角色信息：' + currentRole}
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
        <Form.Item name="name" label="角色名">
          <Input defaultValue={currentRole} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Role: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('');
  const [roleId, setRoleId] = useState(0);
  const { currentProject, roleData, setRoleData } = useModel('cmdb');

  const columns: ColumnsType<CMDB.Role> = [
    {
      title: '角色名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="修改角色">
            <Button
              type="dashed"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentRole(record.name);
                setRoleId(record.id);
                setOpen(true);
              }}
            ></Button>
          </Tooltip>
          <Tooltip title="删除角色">
            <Button
              type="dashed"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={async () => {
                try {
                  const msg = await deleteOneRole(record);
                  console.log(msg);
                  const data = await getRoleList(record.project);
                  setRoleData(data.map((item) => ({ ...item, key: item.id })));
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

  const createRole = async (values: CMDB.Role) => {
    try {
      const msg = await createNewRole({ ...values, project: currentProject });
      console.log(msg);
      const data = await getRoleList(currentProject);
      setRoleData(data.map((item) => ({ ...item, key: item.id })));
    } catch (error) {
      console.log(error);
    }
  };

  const modifyRole = async (id: number, name: string) => {
    try {
      const msg = await modifyOneRole({
        id: id,
        name: name,
        project: currentProject,
      });
      console.log(msg);
      const data = await getRoleList(currentProject);
      setRoleData(data.map((item) => ({ ...item, key: item.id })));
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
      const data = await getRoleList(project);
      setRoleData(data.map((item) => ({ ...item, key: item.id })));
    })();
  }, []);

  const onCreate = (values: any) => {
    console.log('Received values of form: ', values);
    modifyRole(roleId, values.name);
    setOpen(false);
  };

  //   console.log(machineData);
  return (
    <div>
      <ModifyRoleForm
        open={open}
        currentRole={currentRole}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <Card>
        <Form
          layout="inline"
          onFinish={async (values) => {
            await createRole(values as CMDB.Role);
          }}
        >
          <Form.Item
            label="角色名"
            name="name"
            rules={[{ required: true, message: '请填入角色名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              新增角色
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Table columns={columns} dataSource={roleData} />
    </div>
  );
};

export default Role;
