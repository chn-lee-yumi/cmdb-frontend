import request from 'umi-request';

export async function getToken() {
  let token = '';
  await request<CMDB.Token>('/api/v1/token', {
    skipErrorHandler: true,
  })
    .then(function (response) {
      token = response.token;
    })
    .catch(function (error) {
      console.log(error);
    });
  return token;
}

export async function getProjectList() {
  return request<CMDB.Project[]>('/api/v1/Project/', {
    skipErrorHandler: true,
  });
}

export async function getMachineList(currentProject: string) {
  return request<CMDB.Machine[]>('/api/v1/Machine/', {
    params: {
      project: currentProject,
    },
    skipErrorHandler: true,
  });
}

export async function createMachine(param: CMDB.CreateMachineParam) {
  let CSRFToken = await getToken();
  return request('/api/v1/Machine/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRFToken,
    },
    data: param,
  });
}

export async function deleteMachine(param: CMDB.DeleteMachineParam) {
  let CSRFToken = await getToken();
  return request('/api/v1/Machine/' + param.id + '/?project=' + param.project, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': CSRFToken,
    },
  });
}

export async function modifyMachine(param: CMDB.ModifyMachineParam) {
  let CSRFToken = await getToken();
  return request('/api/v1/Machine/' + param.id + '/?project=' + param.currentProject, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRFToken,
    },
    data: param,
  });
}

export async function getRoleList(project: string) {
  return request<CMDB.Role[]>('/api/v1/Role/?project=' + project, {
    skipErrorHandler: true,
  });
}

export async function createRole(param: CMDB.Role) {
  let CSRFToken = await getToken();
  return request('/api/v1/Role/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRFToken,
    },
    data: param,
  });
}

export async function deleteRole(param: CMDB.Role) {
  let CSRFToken = await getToken();
  return request('/api/v1/Role/' + param.id + '/?project=' + param.project, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': CSRFToken,
    },
  });
}

export async function modifyRole(param: CMDB.Role) {
  let CSRFToken = await getToken();
  return request('/api/v1/Role/' + param.id + '/?project=' + param.project, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRFToken,
    },
    data: param,
  });
}

export async function getGroupList(project: string) {
  return request<CMDB.Group[]>('/api/v1/Group/?project=' + project, {
    skipErrorHandler: true,
  });
}

export async function createGroup(param: CMDB.Group) {
  let CSRFToken = await getToken();
  return request('/api/v1/Group/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRFToken,
    },
    data: param,
  });
}

export async function deleteGroup(param: CMDB.Group) {
  let CSRFToken = await getToken();
  return request('/api/v1/Group/' + param.id + '/?project=' + param.project, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': CSRFToken,
    },
  });
}

export async function modifyGroup(param: CMDB.Group) {
  let CSRFToken = await getToken();
  return request('/api/v1/Group/' + param.id + '/?project=' + param.project, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRFToken,
    },
    data: param,
  });
}
