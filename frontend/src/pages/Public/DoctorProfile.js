import React from 'react';
import { useParams } from 'react-router-dom';

const DoctorProfile = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Doctor Profile</h1>
      <p className="text-gray-600">Viewing profile for doctor id: {id}</p>
      <p className="text-gray-500 mt-2">This is a placeholder component.</p>
    </div>
  );
};

export default DoctorProfile;


