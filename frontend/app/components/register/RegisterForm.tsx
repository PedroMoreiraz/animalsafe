import React from 'react';
import tailwind from 'tailwindcss/tailwind.css';
import Button from '../utilities/Button';

function RegisterForm() {

  return (
    <div className="flex flex-col items-center p-4 py-40" >
      <h2 className="text-black text-[25px] font-bold">Register</h2>
      <form className="flex flex-col items-center gap-4 pt-5 p-5">
        <input className="bg-black rounded-md placeholder:pl-2 placeholder:text-white" type="text" placeholder="Username" />
        <input className="bg-black rounded-md placeholder:pl-2 placeholder:text-white" type="email" placeholder="Email" />
        <input className="bg-black rounded-md placeholder:pl-2 placeholder:text-white" type="password" placeholder="Password" />
        <input className="bg-black rounded-md placeholder:pl-2 placeholder:text-white" type="password" placeholder="Confirm Password" />
        <Button />
      </form>
    </div>
  );

}

export default RegisterForm;