const getCounsellorDataFormat = (payload) => {
  const { role, counsellorId, ...getCounsellorData } = payload;
  return {
    ...getCounsellorData,
    organizations: [
      {
        role: 'Counsellor',
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
        role: 'SchoolAdmin',
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
