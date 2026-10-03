import React from 'react';
import tailwind from 'tailwindcss/tailwind.css';

function LoginForm() {

  return (
    <div className="flex flex-col items-center p-4 py-40" >
      <h2 className="text-black text-[25px] font-bold">Login</h2>
      <form className="flex flex-col items-center gap-4 pt-5 p-5">
        <input className="bg-black rounded-md placeholder:pl-2 placeholder:text-white" type="email" placeholder="Email" />
        <input className="bg-black rounded-md placeholder:pl-2 placeholder:text-white" type="password" placeholder="Password" />
        <button className="bg-black py-1 p-8 rounded-md" type="submit">Login</button>
      </form>
    </div>
  );

}

export default LoginForm;