import api from './api';
import { INITIAL_EMPLOYEES } from './mockData';

const EMPLOYEES_KEY = 'saree_employees_data';

const getStoredEmployees = () => {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  if (!data) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_EMPLOYEES;
  }
};

const saveEmployees = (employees) => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const employeeService = {
  getEmployees: async (search = '') => {
    // TODO: replace with API call: return (await api.get('/employees', { params: { search } })).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    let list = getStoredEmployees();

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    return list;
  },

  createEmployee: async (employeeData) => {
    // TODO: replace with API call: return (await api.post('/employees', employeeData)).data;
    await new Promise((resolve) => setTimeout(resolve, 350));
    const list = getStoredEmployees();
    const newEmp = {
      ...employeeData,
      id: `emp-${Date.now()}`,
      status: employeeData.status || 'Active',
      roleType: employeeData.roleType || 'staff',
      createdAt: new Date().toISOString(),
    };
    const updated = [newEmp, ...list];
    saveEmployees(updated);
    return newEmp;
  },

  updateEmployee: async (id, updateData) => {
    // TODO: replace with API call: return (await api.put(`/employees/${id}`, updateData)).data;
    await new Promise((resolve) => setTimeout(resolve, 350));
    const list = getStoredEmployees();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Employee not found');

    list[index] = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    saveEmployees(list);
    return list[index];
  },

  deleteEmployee: async (id) => {
    // TODO: replace with API call: return (await api.delete(`/employees/${id}`)).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    let list = getStoredEmployees();
    list = list.filter((e) => e.id !== id);
    saveEmployees(list);
    return { success: true, id };
  },
};
