'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './unit-filter.css';

interface Apartment {
  id: string;
  code: string;
  floor: string;
  number: string;
  status: string;
  title: string;
  price: string;
  svgBlueprint: React.ReactNode;
}

const apartments: Apartment[] = [
  {
    id: '1', code: '1BR Junior', floor: '23 floor', number: 'N° 1', status: 'Avaible',
    title: '1 Bedroom Junior, 50.5 m²', price: '$186 004',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="10" y1="110" x2="190" y2="110" stroke="#2b3541" strokeWidth="2"/>
        <line x1="190" y1="10" x2="190" y2="170" stroke="#2b3541" strokeWidth="2"/>
        <line x1="190" y1="170" x2="290" y2="170" stroke="#2b3541" strokeWidth="2"/>
        <rect x="25" y="20" width="65" height="50" fill="none" stroke="#8e949a" strokeDasharray="2,2"/>
        <circle cx="57" cy="45" r="3" fill="#8e949a"/>
        <path d="M110,35 Q130,55 110,75" fill="none" stroke="#8e949a"/>
        <text x="70" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living + Kitchen</text>
        <text x="70" y="155" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">6.9 x 2.6</text>
        <text x="70" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
        <text x="70" y="60" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.4 x 2.6</text>
        <text x="240" y="65" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bathroom</text>
        <text x="240" y="78" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">2.4 x 1.8</text>
        <rect x="20" y="170" width="80" height="30" fill="none" stroke="#8e949a"/>
        <circle cx="190" cy="140" r="14" fill="none" stroke="#8e949a"/>
        <rect x="255" y="125" width="25" height="35" fill="none" stroke="#8e949a"/>
      </svg>
    )
  },
  {
    id: '2', code: '1BR-A', floor: '23 floor', number: 'N° 2', status: 'Reserved',
    title: '1 Bedroom Type A, 67.8 m²', price: '$230 214',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="30" y="10" width="240" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="155" y1="10" x2="155" y2="150" stroke="#2b3541" strokeWidth="2"/>
        <line x1="155" y1="150" x2="270" y2="150" stroke="#2b3541" strokeWidth="2"/>
        <line x1="155" y1="170" x2="155" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <circle cx="90" cy="65" r="28" fill="none" stroke="#8e949a"/>
        <text x="95" y="95" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="95" y="110" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.7 x 7.3</text>
        <rect x="175" y="30" width="75" height="70" fill="none" stroke="#8e949a"/>
        <text x="212" y="115" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
        <text x="212" y="128" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.4 x 4.5</text>
        <text x="245" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
        <text x="245" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.0 x 2.2</text>
        <text x="185" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
        <text x="185" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">1.3 x 2.2</text>
      </svg>
    )
  },
  {
    id: '3', code: '1BR-B', floor: '1 floor', number: 'N° 3', status: 'Avaible',
    title: '1 Bedroom Type B, 67.8 m²', price: '$224 103',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <path d="M30,10 L270,10 C270,10 270,170 270,170 C270,170 240,200 190,160 L30,40 Z" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <path d="M30,10 L30,40 M270,10 L270,180 C270,195 250,210 230,195 L65,55" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="110" y1="10" x2="110" y2="75" stroke="#2b3541" strokeWidth="2"/>
        <line x1="110" y1="75" x2="270" y2="75" stroke="#2b3541" strokeWidth="2"/>
        <text x="75" y="28" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
        <text x="75" y="38" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.6 x 1.6</text>
        <text x="75" y="60" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
        <text x="75" y="70" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.2 x 1.4</text>
        <text x="210" y="32" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
        <text x="210" y="44" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">4.7 x 3.1</text>
        <text x="180" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="180" y="152" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">8.3 x 6.8</text>
        <circle cx="165" cy="110" r="14" fill="none" stroke="#8e949a"/>
        <rect x="185" y="85" width="65" height="25" fill="none" stroke="#8e949a"/>
      </svg>
    )
  },
  {
    id: '4', code: '2BR-A', floor: '15 floor', number: 'N° 4', status: 'Reserved',
    title: '2 Bedroom Type A, 95.2 m²', price: '$312 500',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="150" y1="10" x2="150" y2="130" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="130" x2="290" y2="130" stroke="#2b3541" strokeWidth="2"/>
        <text x="80" y="70" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="80" y="85" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">5.5 x 4.2</text>
        <text x="220" y="50" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="220" y="63" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.0 x 3.5</text>
        <text x="220" y="100" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="220" y="113" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.8 x 3.2</text>
        <text x="150" y="180" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
        <text x="150" y="193" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">2.5 x 2.0</text>
      </svg>
    )
  },
  {
    id: '5', code: '2BR-B', floor: '18 floor', number: 'N° 5', status: 'Avaible',
    title: '2 Bedroom Type B, 112.5 m²', price: '$378 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="120" y1="10" x2="120" y2="100" stroke="#2b3541" strokeWidth="2"/>
        <line x1="120" y1="100" x2="290" y2="100" stroke="#2b3541" strokeWidth="2"/>
        <line x1="200" y1="100" x2="200" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <text x="65" y="55" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="65" y="68" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">6.0 x 4.5</text>
        <text x="160" y="55" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="160" y="68" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.2 x 3.8</text>
        <text x="245" y="55" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="245" y="68" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.0 x 3.5</text>
        <text x="155" y="160" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
        <text x="155" y="173" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">2.8 x 2.2</text>
        <text x="245" y="160" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
        <text x="245" y="173" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">1.5 x 1.2</text>
      </svg>
    )
  },
  {
    id: '6', code: '2BR-C', floor: '20 floor', number: 'N° 6', status: 'Reserved',
    title: '2 Bedroom Type C, 128.0 m²', price: '$425 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="140" y1="10" x2="140" y2="110" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="110" x2="200" y2="110" stroke="#2b3541" strokeWidth="2"/>
        <line x1="200" y1="10" x2="200" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <text x="75" y="60" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="75" y="73" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">7.2 x 5.0</text>
        <text x="170" y="55" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="170" y="68" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.5 x 4.0</text>
        <text x="170" y="100" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="170" y="113" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.2 x 3.6</text>
        <text x="245" y="100" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 1</text>
        <text x="245" y="112" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.5 x 2.0</text>
        <text x="245" y="160" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 2</text>
        <text x="245" y="172" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.0 x 1.8</text>
      </svg>
    )
  },
  {
    id: '7', code: '3BR-A', floor: '25 floor', number: 'N° 7', status: 'Avaible',
    title: '3 Bedroom Type A, 165.0 m²', price: '$542 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="100" y1="10" x2="100" y2="90" stroke="#2b3541" strokeWidth="2"/>
        <line x1="200" y1="10" x2="200" y2="90" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="90" x2="290" y2="90" stroke="#2b3541" strokeWidth="2"/>
        <line x1="150" y1="90" x2="150" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <text x="55" y="50" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="55" y="63" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">5.0 x 4.2</text>
        <text x="150" y="50" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="150" y="63" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.5 x 3.8</text>
        <text x="245" y="50" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 3</text>
        <text x="245" y="63" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.0 x 3.5</text>
        <text x="80" y="155" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="80" y="168" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">8.0 x 5.5</text>
        <text x="220" y="140" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 1</text>
        <text x="220" y="152" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">3.0 x 2.5</text>
        <text x="220" y="185" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 2</text>
        <text x="220" y="197" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.5 x 2.0</text>
      </svg>
    )
  },
  {
    id: '8', code: '3BR-B', floor: '28 floor', number: 'N° 8', status: 'Reserved',
    title: '3 Bedroom Type B, 185.0 m²', price: '$612 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="100" y1="10" x2="100" y2="80" stroke="#2b3541" strokeWidth="2"/>
        <line x1="190" y1="10" x2="190" y2="80" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="80" x2="290" y2="80" stroke="#2b3541" strokeWidth="2"/>
        <line x1="100" y1="80" x2="100" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <line x1="200" y1="80" x2="200" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <text x="55" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="55" y="58" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">5.5 x 4.5</text>
        <text x="145" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="145" y="58" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.8 x 4.0</text>
        <text x="240" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 3</text>
        <text x="240" y="58" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.5 x 3.8</text>
        <text x="55" y="145" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="55" y="158" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">9.0 x 6.0</text>
        <text x="150" y="140" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 1</text>
        <text x="150" y="152" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">3.2 x 2.8</text>
        <text x="245" y="140" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 2</text>
        <text x="245" y="152" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.8 x 2.2</text>
        <text x="245" y="190" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
        <text x="245" y="202" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">1.8 x 1.5</text>
      </svg>
    )
  },
  {
    id: '9', code: '4BR', floor: '30 floor', number: 'N° 9', status: 'Avaible',
    title: '4 Bedroom, 245.0 m²', price: '$849 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="80" y1="10" x2="80" y2="70" stroke="#2b3541" strokeWidth="2"/>
        <line x1="155" y1="10" x2="155" y2="70" stroke="#2b3541" strokeWidth="2"/>
        <line x1="230" y1="10" x2="230" y2="70" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="70" x2="290" y2="70" stroke="#2b3541" strokeWidth="2"/>
        <line x1="145" y1="70" x2="145" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <text x="45" y="40" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="45" y="52" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">6.0 x 5.0</text>
        <text x="118" y="40" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="118" y="52" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">5.0 x 4.5</text>
        <text x="192" y="40" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 3</text>
        <text x="192" y="52" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">4.8 x 4.2</text>
        <text x="260" y="40" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 4</text>
        <text x="260" y="52" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">4.5 x 4.0</text>
        <text x="75" y="145" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="75" y="158" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">10.0 x 7.0</text>
        <text x="220" y="120" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 1</text>
        <text x="220" y="132" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">3.5 x 3.0</text>
        <text x="220" y="165" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 2</text>
        <text x="220" y="177" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">3.0 x 2.5</text>
        <text x="220" y="200" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
        <text x="220" y="210" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.0 x 1.8</text>
      </svg>
    )
  },
  {
    id: '10', code: '1BR-D', floor: '5 floor', number: 'N° 10', status: 'Reserved',
    title: '1 Bedroom Type D, 55.0 m²', price: '$198 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="160" y1="10" x2="160" y2="130" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="130" x2="290" y2="130" stroke="#2b3541" strokeWidth="2"/>
        <text x="85" y="70" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="85" y="83" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">5.0 x 3.8</text>
        <text x="225" y="55" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
        <text x="225" y="68" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.2 x 3.5</text>
        <text x="150" y="180" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
        <text x="150" y="193" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">2.2 x 1.8</text>
      </svg>
    )
  },
  {
    id: '11', code: '2BR-D', floor: '12 floor', number: 'N° 11', status: 'Avaible',
    title: '2 Bedroom Type D, 108.0 m²', price: '$355 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="130" y1="10" x2="130" y2="110" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="110" x2="200" y2="110" stroke="#2b3541" strokeWidth="2"/>
        <line x1="200" y1="10" x2="200" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <text x="70" y="60" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="70" y="73" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">6.5 x 4.8</text>
        <text x="165" y="55" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="165" y="68" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.5 x 4.0</text>
        <text x="165" y="100" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="165" y="113" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.2 x 3.6</text>
        <text x="245" y="100" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
        <text x="245" y="112" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.8 x 2.2</text>
        <text x="245" y="160" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
        <text x="245" y="172" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">1.6 x 1.4</text>
      </svg>
    )
  },
  {
    id: '12', code: '3BR-C', floor: '22 floor', number: 'N° 12', status: 'Reserved',
    title: '3 Bedroom Type C, 172.0 m²', price: '$568 000',
    svgBlueprint: (
      <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
        <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
        <line x1="110" y1="10" x2="110" y2="85" stroke="#2b3541" strokeWidth="2"/>
        <line x1="210" y1="10" x2="210" y2="85" stroke="#2b3541" strokeWidth="2"/>
        <line x1="10" y1="85" x2="290" y2="85" stroke="#2b3541" strokeWidth="2"/>
        <line x1="145" y1="85" x2="145" y2="210" stroke="#2b3541" strokeWidth="2"/>
        <text x="60" y="48" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 1</text>
        <text x="60" y="61" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">5.2 x 4.5</text>
        <text x="160" y="48" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 2</text>
        <text x="160" y="61" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.8 x 4.0</text>
        <text x="250" y="48" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom 3</text>
        <text x="250" y="61" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.5 x 3.8</text>
        <text x="75" y="150" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
        <text x="75" y="163" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">8.5 x 5.8</text>
        <text x="220" y="135" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 1</text>
        <text x="220" y="147" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">3.0 x 2.5</text>
        <text x="220" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath 2</text>
        <text x="220" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.5 x 2.2</text>
      </svg>
    )
  },
];

export default function UnitLayout() {
  const [currency, setCurrency] = useState('USD');
  const [floor, setFloor] = useState('3');
  const [view, setView] = useState('Sea view');
  const [status, setStatus] = useState('Available');
  const [selectedRooms, setSelectedRooms] = useState<string>('1');

  const [priceMin, setPriceMin] = useState(188874);
  const [priceMax, setPriceMax] = useState(849849);
  const totalPriceMin = 50000;
  const totalPriceMax = 1500000;

  const [areaMin, setAreaMin] = useState(35);
  const [areaMax, setAreaMax] = useState(430);
  const totalAreaMin = 10;
  const totalAreaMax = 600;

  const roomOptions = ['S', '1', '2', '3', '4+'];

  const priceLeftPercent = ((priceMin - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;
  const priceRightPercent = 100 - ((priceMax - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;

  const areaLeftPercent = ((areaMin - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;
  const areaRightPercent = 100 - ((areaMax - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <section className="layout-section">
        
        {/* HEADER */}
        <div className="layout-header">
          <h2 className="layout-title">
            <span className="layout-title-thin">UnIt</span>
            <span className="layout-title-bold">layouts</span>
            <span className="layout-count">(124)</span>
          </h2>
        </div>

        {/* FILTERS CONTAINER */}
        <div className="filters-grid">
          
          {/* Price Filter */}
          <div className="filter-group filter-group--price">
            <label className="filter-label">Price</label>
            <div className="filter-inputs-wrapper">
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>from</span>
                  <input 
                    type="text" 
                    value={formatNumber(priceMin)} 
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\s+/g, ''));
                      if (!isNaN(val)) setPriceMin(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={formatNumber(priceMax)} 
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\s+/g, ''));
                      if (!isNaN(val)) setPriceMax(val);
                    }}
                  />
                </div>
              </div>
              
              <div className="select-wrapper currency-select">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="AZN">AZN</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            <div className="slider-container">
              <div className="slider-base-track"></div>
              <div 
                className="slider-active-track" 
                style={{ left: `${priceLeftPercent}%`, right: `${priceRightPercent}%` }}
              ></div>
              <input 
                type="range" 
                min={totalPriceMin} 
                max={totalPriceMax} 
                value={priceMin}
                className="thumb thumb--left"
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceMax - 1000);
                  setPriceMin(val);
                }}
              />
              <input 
                type="range" 
                min={totalPriceMin} 
                max={totalPriceMax} 
                value={priceMax}
                className="thumb thumb--right"
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceMin + 1000);
                  setPriceMax(val);
                }}
              />
            </div>
          </div>

          {/* Area & Floor Wrapper */}
          <div className="mobile-flex-row filter-group--area-floor">
            <div className="filter-group filter-group--area">
              <label className="filter-label">Area (m²)</label>
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>from</span>
                  <input 
                    type="text" 
                    value={areaMin} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setAreaMin(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={areaMax} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setAreaMax(val);
                    }}
                  />
                </div>
              </div>
              
              <div className="slider-container">
                <div className="slider-base-track"></div>
                <div 
                  className="slider-active-track" 
                  style={{ left: `${areaLeftPercent}%`, right: `${areaRightPercent}%` }}
                ></div>
                <input 
                  type="range" 
                  min={totalAreaMin} 
                  max={totalAreaMax} 
                  value={areaMin}
                  className="thumb thumb--left"
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), areaMax - 5);
                    setAreaMin(val);
                  }}
                />
                <input 
                  type="range" 
                  min={totalAreaMin} 
                  max={totalAreaMax} 
                  value={areaMax}
                  className="thumb thumb--right"
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), areaMin + 5);
                    setAreaMax(val);
                  }}
                />
              </div>
            </div>

            <div className="filter-group filter-group--floor">
              <label className="filter-label">Floor</label>
              <div className="select-wrapper">
                <select value={floor} onChange={(e) => setFloor(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>
          </div>

          {/* View & Status Wrapper */}
          <div className="mobile-flex-row filter-group--view-status">
            <div className="filter-group filter-group--view">
              <label className="filter-label">View</label>
              <div className="select-wrapper">
                <select value={view} onChange={(e) => setView(e.target.value)}>
                  <option value="Sea view">Sea view</option>
                  <option value="City view">City view</option>
                  <option value="Garden view">Garden view</option>
                </select>
              </div>
            </div>

            <div className="filter-group filter-group--status">
              <label className="filter-label">Status</label>
              <div className="select-wrapper">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Number of Rooms Filter */}
          <div className="filter-group filter-group--rooms">
            <label className="filter-label">Number of rooms</label>
            <div className="rooms-group">
              {roomOptions.map((room) => (
                <button
                  key={room}
                  type="button"
                  className={`room-btn ${selectedRooms === room ? 'room-btn--active' : ''}`}
                  onClick={() => setSelectedRooms(room)}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RESULTS & RESET ROW */}
        <div className="results-row">
          <span className="results-count">24 apartments found</span>
          <button type="button" className="reset-btn">Reset filters</button>
        </div>

        {/* BANNER CARD */}
        <div className="complex-banner">
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h3 className="banner-title">Panorama by ELIE SAAB</h3>
            <div className="banner-actions">
              <button className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Get a Consultation</span>
              </button>
              <button className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <line x1="9" y1="22" x2="9" y2="16"/>
                  <line x1="15" y1="22" x2="15" y2="16"/>
                  <line x1="9" y1="16" x2="15" y2="16"/>
                  <path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01"/>
                </svg>
                <span>More About the Residential Complex</span>
              </button>
            </div>
          </div>
        </div>

        {/* APARTMENT CARDS GRID */}
        <div className="cards-grid">
          {apartments.map((apt) => (
            <Link key={apt.id} href={`/az/off-plan/${apt.id}`} className="layout-card">
              <div className="layout-card__header">
                <div className="layout-card__title-block">
                  <span className="layout-card__code">{apt.code}</span>
                  <span className="layout-card__floor">{apt.floor}</span>
                </div>
                <div className="layout-card__number-block">
                  <span className="layout-card__number">{apt.number}</span>
                  <span className="layout-card__status">{apt.status}</span>
                </div>
              </div>
              
              <div className="layout-card__visual">
                {apt.svgBlueprint}
              </div>

              <div className="layout-card__footer">
                <h2 className="layout-card__name">{apt.title}</h2>
                <span className="layout-card__price">{apt.price}</span>
              </div>
            </Link>
          ))}
        </div>
    </section>
  );
}
