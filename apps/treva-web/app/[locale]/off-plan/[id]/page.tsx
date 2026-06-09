"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import PageContainer from "@/app/components/Container/PageContainer";
import "../off-plan.css";
import "./off-plan-detail.css";

interface Room {
  name: string;
  dimensions: string;
}

interface Apartment {
  id: string;
  code: string;
  floor: string;
  number: string;
  rooms: Room[];
  title: string;
  totalArea: string;
  internalArea: string;
  balcony: string;
  price: string;
  status: string;
}

const apartments: Record<string, Apartment> = {
  '1': { id: '1', code: '1BR Junior', floor: '23', number: '1', rooms: [{ name: 'Living + Kitchen', dimensions: '6.9 x 2.6' }, { name: 'Bedroom', dimensions: '4.4 x 2.6' }, { name: 'Bathroom', dimensions: '2.4 x 1.8' }], title: '1 Bedroom Junior Apartment', totalArea: '50.5', internalArea: '43.0', balcony: '7.5', price: '186 004', status: 'Avaible' },
  '2': { id: '2', code: '1BR-A', floor: '23', number: '2', rooms: [{ name: 'Living & Kitchen', dimensions: '3.7 x 7.3' }, { name: 'Bedroom', dimensions: '3.4 x 4.5' }, { name: 'Bath', dimensions: '2.0 x 2.2' }, { name: 'Powder', dimensions: '1.3 x 2.2' }], title: '1 Bedroom Type A', totalArea: '67.8', internalArea: '58.0', balcony: '9.8', price: '230 214', status: 'Reserved' },
  '3': { id: '3', code: '1BR-B', floor: '1', number: '3', rooms: [{ name: 'Bath', dimensions: '2.6 x 1.6' }, { name: 'Powder', dimensions: '2.2 x 1.4' }, { name: 'Bedroom', dimensions: '4.7 x 3.1' }, { name: 'Living & Kitchen', dimensions: '8.3 x 6.8' }], title: '1 Bedroom Type B', totalArea: '67.8', internalArea: '58.2', balcony: '9.6', price: '224 103', status: 'Avaible' },
  '4': { id: '4', code: '2BR-A', floor: '15', number: '4', rooms: [{ name: 'Living & Kitchen', dimensions: '5.5 x 4.2' }, { name: 'Bedroom 1', dimensions: '4.0 x 3.5' }, { name: 'Bedroom 2', dimensions: '3.8 x 3.2' }, { name: 'Bath', dimensions: '2.5 x 2.0' }], title: '2 Bedroom Type A', totalArea: '95.2', internalArea: '82.0', balcony: '13.2', price: '312 500', status: 'Reserved' },
  '5': { id: '5', code: '2BR-B', floor: '18', number: '5', rooms: [{ name: 'Living & Kitchen', dimensions: '6.0 x 4.5' }, { name: 'Bedroom 1', dimensions: '4.2 x 3.8' }, { name: 'Bedroom 2', dimensions: '4.0 x 3.5' }, { name: 'Bath', dimensions: '2.8 x 2.2' }, { name: 'Powder', dimensions: '1.5 x 1.2' }], title: '2 Bedroom Type B', totalArea: '112.5', internalArea: '96.0', balcony: '16.5', price: '378 000', status: 'Avaible' },
  '6': { id: '6', code: '2BR-C', floor: '20', number: '6', rooms: [{ name: 'Living & Kitchen', dimensions: '7.2 x 5.0' }, { name: 'Bedroom 1', dimensions: '4.5 x 4.0' }, { name: 'Bedroom 2', dimensions: '4.2 x 3.6' }, { name: 'Bath 1', dimensions: '2.5 x 2.0' }, { name: 'Bath 2', dimensions: '2.0 x 1.8' }], title: '2 Bedroom Type C', totalArea: '128.0', internalArea: '110.0', balcony: '18.0', price: '425 000', status: 'Reserved' },
  '7': { id: '7', code: '3BR-A', floor: '25', number: '7', rooms: [{ name: 'Living & Kitchen', dimensions: '8.0 x 5.5' }, { name: 'Bedroom 1', dimensions: '5.0 x 4.2' }, { name: 'Bedroom 2', dimensions: '4.5 x 3.8' }, { name: 'Bedroom 3', dimensions: '4.0 x 3.5' }, { name: 'Bath 1', dimensions: '3.0 x 2.5' }, { name: 'Bath 2', dimensions: '2.5 x 2.0' }], title: '3 Bedroom Type A', totalArea: '165.0', internalArea: '142.0', balcony: '23.0', price: '542 000', status: 'Avaible' },
  '8': { id: '8', code: '3BR-B', floor: '28', number: '8', rooms: [{ name: 'Living & Kitchen', dimensions: '9.0 x 6.0' }, { name: 'Bedroom 1', dimensions: '5.5 x 4.5' }, { name: 'Bedroom 2', dimensions: '4.8 x 4.0' }, { name: 'Bedroom 3', dimensions: '4.5 x 3.8' }, { name: 'Bath 1', dimensions: '3.2 x 2.8' }, { name: 'Bath 2', dimensions: '2.8 x 2.2' }, { name: 'Powder', dimensions: '1.8 x 1.5' }], title: '3 Bedroom Type B', totalArea: '185.0', internalArea: '160.0', balcony: '25.0', price: '612 000', status: 'Reserved' },
  '9': { id: '9', code: '4BR', floor: '30', number: '9', rooms: [{ name: 'Living & Kitchen', dimensions: '10.0 x 7.0' }, { name: 'Bedroom 1', dimensions: '6.0 x 5.0' }, { name: 'Bedroom 2', dimensions: '5.0 x 4.5' }, { name: 'Bedroom 3', dimensions: '4.8 x 4.2' }, { name: 'Bedroom 4', dimensions: '4.5 x 4.0' }, { name: 'Bath 1', dimensions: '3.5 x 3.0' }, { name: 'Bath 2', dimensions: '3.0 x 2.5' }, { name: 'Powder', dimensions: '2.0 x 1.8' }], title: '4 Bedroom', totalArea: '245.0', internalArea: '212.0', balcony: '33.0', price: '849 000', status: 'Avaible' },
  '10': { id: '10', code: '1BR-D', floor: '5', number: '10', rooms: [{ name: 'Living & Kitchen', dimensions: '5.0 x 3.8' }, { name: 'Bedroom', dimensions: '4.2 x 3.5' }, { name: 'Bath', dimensions: '2.2 x 1.8' }], title: '1 Bedroom Type D', totalArea: '55.0', internalArea: '47.0', balcony: '8.0', price: '198 000', status: 'Reserved' },
  '11': { id: '11', code: '2BR-D', floor: '12', number: '11', rooms: [{ name: 'Living & Kitchen', dimensions: '6.5 x 4.8' }, { name: 'Bedroom 1', dimensions: '4.5 x 4.0' }, { name: 'Bedroom 2', dimensions: '4.2 x 3.6' }, { name: 'Bath', dimensions: '2.8 x 2.2' }, { name: 'Powder', dimensions: '1.6 x 1.4' }], title: '2 Bedroom Type D', totalArea: '108.0', internalArea: '92.0', balcony: '16.0', price: '355 000', status: 'Avaible' },
  '12': { id: '12', code: '3BR-C', floor: '22', number: '12', rooms: [{ name: 'Living & Kitchen', dimensions: '8.5 x 5.8' }, { name: 'Bedroom 1', dimensions: '5.2 x 4.5' }, { name: 'Bedroom 2', dimensions: '4.8 x 4.0' }, { name: 'Bedroom 3', dimensions: '4.5 x 3.8' }, { name: 'Bath 1', dimensions: '3.0 x 2.5' }, { name: 'Bath 2', dimensions: '2.5 x 2.2' }], title: '3 Bedroom Type C', totalArea: '172.0', internalArea: '148.0', balcony: '24.0', price: '568 000', status: 'Reserved' },
};

export default function OffPlanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const apartment = apartments[id];

  if (!apartment) {
    return (
      <div className="page-wrapper">
        <Navbar variant="solid" />
        <main className="main-wrapper">
          <PageContainer>
            <div className="detail-not-found">
              <h2>Apartment not found</h2>
              <Link href="/az/off-plan">Back to listings</Link>
            </div>
          </PageContainer>
        </main>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer>
          {/* BREADCRUMB */}
          <nav className="detail-breadcrumb">
            <Link href="/az">Main</Link>
            <span>/</span>
            <Link href="/az/off-plan">Panorama by ELIE SAAB</Link>
            <span>/</span>
            <span>N° {apartment.number}</span>
          </nav>

          {/* DETAIL CONTENT */}
          <div className="detail-content">
            {/* FLOOR PLAN IMAGE */}
            <div className="detail-plan">
              <div className="detail-plan__placeholder">
                <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="400" height="300" fill="#f5f5f5"/>
                  <text x="200" y="150" textAnchor="middle" fill="#999" fontSize="14">Floor Plan</text>
                </svg>
              </div>
            </div>

            {/* APARTMENT INFO */}
            <div className="detail-info">
              <h1 className="detail-info__title">{apartment.title}</h1>
              
              <div className="detail-info__tags">
                <span className="detail-tag detail-tag--status">{apartment.status}</span>
                <button className="detail-tag detail-tag--pdf">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  PDF
                </button>
                <button className="detail-tag detail-tag--download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
              </div>

              <div className="detail-info__specs">
                <div className="detail-spec">
                  <span className="detail-spec__label">Floor</span>
                  <span className="detail-spec__value">{apartment.floor}</span>
                </div>
                <div className="detail-spec">
                  <span className="detail-spec__label">Total Area</span>
                  <span className="detail-spec__value">{apartment.totalArea} m²</span>
                </div>
                <div className="detail-spec">
                  <span className="detail-spec__label">Internal Area</span>
                  <span className="detail-spec__value">{apartment.internalArea} m²</span>
                </div>
                <div className="detail-spec">
                  <span className="detail-spec__label">Balcony</span>
                  <span className="detail-spec__value">{apartment.balcony} m²</span>
                </div>
              </div>

              <div className="detail-info__price">
                <button className="detail-price__currency">
                  USD
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <span className="detail-price__amount">{apartment.price}</span>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>
      <HomeFooter />
    </div>
  );
}
