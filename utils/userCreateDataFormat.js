const getCounsellorDataFormat = (payload) => {
  const { role, counsellorId, ...getCounsellorData } = payload;
  return {
    ...getCounsellorData,
    organizations: [
      {
        role,
        counsellorId,
      },
    ],
  };
};

const getSchoolAdminDataFormat = (payload, schoolId) => {
  const { role, counsellorId, ...getSchoolAdminData } = payload;
  return {
    ...getSchoolAdminData,
    organizations: [
      {
        role,
        counsellorId,
        schoolId,
      },
    ],
  };
};

const getStudentDataFormat = (payload, schoolId) => {
  const { role, ...getStudentData } = payload;
  return {
    ...getStudentData,
    schoolId,
    class: ''
  };
};

module.exports = {
  getCounsellorDataFormat,
  getSchoolAdminDataFormat,
  getStudentDataFormat,
};
