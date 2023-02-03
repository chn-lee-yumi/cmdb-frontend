import React, { useEffect, useState } from 'react';
import { HeartTwoTone, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, List, Modal, Select, Tag, Tooltip } from 'antd';
import {
  createMachine as createNewMachine,
  deleteMachine as deleteOneMachine,
  modifyMachine as modifyOneMachine,
  getMachineList,
  getProjectList,
} from '@/services/cmdb/api';
import { useModel } from '@umijs/max';

function isMachineOffline(hearbeat: string) {
  let date = Date.parse(hearbeat);
  if (date < Date.now() - 3 * 60 * 1000) {
    return true;
  } else {
    return false;
  }
}

function convertDate(date: string) {
  let d = Date.parse(date);
  let ds = new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString();
  return ds;
}

function convertUptime(uptime: number) {
  const d = Math.floor(uptime / 60 / 60 / 24);
  let h = Math.floor((uptime - d * 60 * 60 * 24) / 60 / 60);
  let m = Math.floor((uptime - d * 60 * 60 * 24 - h * 60 * 60) / 60);
  let s = uptime - d * 60 * 60 * 24 - h * 60 * 60 - m * 60;
  return (
    d +
    '天' +
    (h < 10 ? '0' + h : h) +
    '时' +
    (m < 10 ? '0' + m : m) +
    '分' +
    (s < 10 ? '0' + s : s) +
    '秒'
  );
}

interface Values {
  newIp: string;
  machineId: number;
}

interface ModifyMachineFormProps {
  open: boolean;
  currentIp: string;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const ModifyMachineForm: React.FC<ModifyMachineFormProps> = ({
  open,
  currentIp,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { projectList, currentProject } = useModel('cmdb');
  return (
    <Modal
      open={open}
      title={'修改机器信息：' + currentIp}
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
        <Form.Item name="ip" label="IP">
          <Input defaultValue={currentIp} />
        </Form.Item>
        <Form.Item name="project" label="项目">
          <Select defaultValue={currentProject} options={projectList} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Machine: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [currentIp, setCurrentIp] = useState('');
  const [machineId, setMachineId] = useState(0);
  const { currentProject, machineData, setMachineData } = useModel('cmdb');

  const createMachine = async (values: CMDB.CreateMachineParam) => {
    try {
      const msg = await createNewMachine({ ...values, project: currentProject });
      console.log(msg);
      const data = await getMachineList(currentProject);
      setMachineData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMachine = async (id: number) => {
    try {
      const msg = await deleteOneMachine({ id: id, project: currentProject });
      console.log(msg);
      const data = await getMachineList(currentProject);
      setMachineData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const modifyMachine = async (id: number, ip: string, project: string) => {
    try {
      const msg = await modifyOneMachine({
        id: id,
        main_ip: ip,
        project: project,
        currentProject: currentProject,
      });
      console.log(msg);
      const data = await getMachineList(currentProject);
      setMachineData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const openModifyMachineForm = (id: number, current_ip: string) => {
    setCurrentIp(current_ip);
    setMachineId(id);
    setOpen(true);
  };

  useEffect(() => {
    (async () => {
      let project = currentProject;
      if (project === '') {
        const projects = await getProjectList();
        project = projects[0].name;
      }
      const data = await getMachineList(project);
      setMachineData(data);
    })();
  }, []);

  const onCreate = (values: any) => {
    console.log('Received values of form: ', values);
    modifyMachine(machineId, values.ip, values.project);
    setOpen(false);
  };

  //   console.log(machineData);
  return (
    <div>
      <ModifyMachineForm
        open={open}
        currentIp={currentIp}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <Card>
        <Form
          layout="inline"
          onFinish={async (values) => {
            await createMachine(values as CMDB.CreateMachineParam);
          }}
        >
          <Form.Item label="机器IP" name="main_ip" rules={[{ required: true, message: '请填入机器IP' }]}>
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              新增机器
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={machineData}
        renderItem={(item) => (
          <List.Item key={item.main_ip}>
            {item.last_heartbeat === null ? (
              <List.Item.Meta
                title={
                  <div>
                    <a>{item.main_ip}</a>(尚未收到机器上传的数据)
                    <Tooltip title="删除机器">
                      <Button
                        type="dashed"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => deleteMachine(item.id)}
                      ></Button>
                    </Tooltip>
                  </div>
                }
              />
            ) : (
              <List.Item.Meta
                title={
                  <div>
                    <a>{item.main_ip}</a>({item.system_info?.hostname})
                    <Tooltip
                      title=<div>
                        <div>最近心跳: {convertDate(item.last_heartbeat)} </div>
                        <div>Uptime: {convertUptime(item.system_info?.uptime)}</div>
                      </div>
                    >
                      {isMachineOffline(item.last_heartbeat) ? (
                        <Tag color="red">
                          <HeartTwoTone twoToneColor="red" />
                        </Tag>
                      ) : (
                        <Tag color="green">
                          <HeartTwoTone twoToneColor="#87d068" />
                        </Tag>
                      )}
                    </Tooltip>
                    <Tag color="blue">
                      {item.system_info?.virtualization_role === 'host' ? '物理机' : '虚拟机'}
                    </Tag>
                    <Tag color="blue">{item.system_info?.kernel_arch}</Tag>
                    <Tooltip title="修改机器信息">
                      <Button
                        type="dashed"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openModifyMachineForm(item.id, item.main_ip)}
                      ></Button>
                    </Tooltip>
                    <Tooltip title="删除机器">
                      <Button
                        type="dashed"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => deleteMachine(item.id)}
                      ></Button>
                    </Tooltip>
                  </div>
                }
                description={
                  <div>
                    <div>
                      <Tag color="volcano">
                        Load: {item.load_avg?.load_1min} {item.load_avg?.load_5min}{' '}
                        {item.load_avg?.load_15min}
                      </Tag>
                      <Tag color="volcano">
                        内存:{' '}
                        {(item.memory_info?.physical_memory_total / 1024 / 1024 / 1024).toFixed(1)}G
                        (使用率{item.memory_info?.physical_memory_used_percent.toFixed(1)}%)
                      </Tag>
                      <Tag color="volcano">
                        SWAP:{' '}
                        {item.memory_info?.swap_memory_total ? (
                          <>
                            {(item.memory_info?.swap_memory_total / 1024 / 1024 / 1024).toFixed(1)}G
                            (使用率{item.memory_info?.swap_memory_used_percent?.toFixed(1) || 0}%)
                          </>
                        ) : (
                          <>无</>
                        )}
                      </Tag>
                      <div></div>
                      <Tag color="magenta">
                        {item.cpu_info?.name} ({item.cpu_info?.physical_count}核/
                        {item.cpu_info?.logical_count}线程)
                      </Tag>
                      <Tag color="magenta">
                        {item.system_info?.os} {item.system_info?.kernel_version} (
                        {item.system_info?.platform} {item.system_info?.platform_version})
                      </Tag>
                    </div>
                    <div>
                      <Tag color="cyan">制造商：{item.device_system_info?.manufacturer}</Tag>
                      <Tag color="cyan">产品名：{item.device_system_info?.product_name}</Tag>
                      <Tag color="cyan">序列号：{item.device_system_info?.serial_number}</Tag>
                      {/* <Tag color="cyan">版本：{item.device_system_info?.version}</Tag> */}
                    </div>
                  </div>
                }
              />
            )}
          </List.Item>
        )}
      />
    </div>
  );
};

export default Machine;
