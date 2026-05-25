"use client";

import React, { useState } from 'react';
import './call-back.css';

type RoleType = 'Client' | 'Developer' | 'Broker';

export default function CallbackForm() {
  const [activeRole, setActiveRole] = useState<RoleType>('Client');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      role: activeRole,
      name,
      phone
    });
  };

  return (
    <main className="container">
      <form onSubmit={handleSubmit} className="formWrapper">
        
        {/* Başlıq Bloku (Orijinal dizaynına qaytarıldı) */}
        <div className="headerContainer">
          <div className="bgLineTop"></div>
          <div className="bgLineBottom"></div>
          <h1 className="title">
            <span className="titleTop">Ready to take</span>
            <span className="titleBottom">the first step?</span>
          </h1>
        </div>

        {/* Alt Başlıq (Yalnız ilk sözün ilk hərfi böyük, qalanları kiçik) */}
        <p className="subtitle">
          Request a callback. One of our managers will be happy to assist you.
        </p>

        {/* Rol Seçimi (Client, Developer, Broker) */}
        <div className="roleSelector">
          {(['Client', 'Developer', 'Broker'] as RoleType[]).map((role) => (
            <button
              key={role}
              type="button"
              className={`roleButton ${activeRole === role ? 'activeRole' : ''}`}
              onClick={() => setActiveRole(role)}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Giriş Sahələri */}
        <div className="inputGroup">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="inputField"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="inputField"
            required
          />
        </div>

        {/* Təsdiq Düyməsi */}
        <button type="submit" className="submitButton">
          Contact me
        </button>

        {/* Hüquqi Məlumat */}
        <p className="disclaimer">
          By clicking the button, you confirm your consent to the processing of <strong>personal data</strong>.
        </p>

      </form>
    </main>
  );
}