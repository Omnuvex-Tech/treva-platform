"use client";

import React, { useState } from 'react';
import './call-back.css';
import PageContainer from '@/app/components/Container/PageContainer';
import { ButtonText } from '@/app/components/ButtonText';

type RoleType = 'Client' | 'Developer' | 'Broker';

type RoleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: RoleType;
  isActive: boolean;
};

function RoleButton({ label, isActive, ...props }: RoleButtonProps) {
  return (
    <button
      type="button"
      className={`roleButton ${isActive ? 'activeRole' : ''}`}
      {...props}
    >
      {label}
    </button>
  );
}

type CallbackSubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

function CallbackSubmitButton({ label, ...props }: CallbackSubmitButtonProps) {
  return (
    <button type="submit" className="submitButton" {...props}>
      <ButtonText>{label}</ButtonText>
    </button>
  );
}

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
    <PageContainer as="main" className="callbackContainer">
      <form onSubmit={handleSubmit} className="formWrapper">
        
        {/* Şəkildəki dizayna tam uyğun Başlıq Bloku */}
        <div className="headerContainer">
          <div className="bgLineTop"></div>
          <div className="bgLineBottom"></div>
          <h1 className="title">
            <span className="titleTop">Ready to take</span>
            <span className="titleBottom">the fIrst step?</span>
          </h1>
        </div>

        {/* Alt Başlıq */}
        <p className="subtitle">
          Request a callback. One of our managers will be happy to assist you.
        </p>

        {/* Rol Seçimi */}
        <div className="roleSelector">
          {(['Client', 'Developer', 'Broker'] as RoleType[]).map((role) => (
            <RoleButton
              key={role}
              label={role}
              isActive={activeRole === role}
              onClick={() => setActiveRole(role)}
            />
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
        <CallbackSubmitButton label="Contact me" />

        {/* Hüquqi Məlumat */}
        <p className="disclaimer">
          By clicking the button, you confirm your consent to the processing of <strong>personal data</strong>.
        </p>

      </form>
    </PageContainer>
  );
}
