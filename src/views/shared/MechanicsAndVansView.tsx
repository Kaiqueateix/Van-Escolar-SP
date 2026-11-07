import React from 'react';
import { ServicesPartnersView } from './ServicesPartnersView';
import { SERVICE_PARTNERS, INITIAL_PARTNER_PROMOTIONS } from '../../constants';

export const MechanicsAndVansView: React.FC = () => {
  return (
    <ServicesPartnersView
      partners={SERVICE_PARTNERS}
      promotions={INITIAL_PARTNER_PROMOTIONS}
    />
  );
};
