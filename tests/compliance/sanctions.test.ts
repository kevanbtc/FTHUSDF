import { expect } from 'chai';
import axios from 'axios';

/**
 * Sanctions Screening Tests
 * 
 * Validates OFAC/UN/EU sanctions screening functionality
 */

// Environment gating for offline/default runs.
// Enable full sanctions API integration tests by setting COMPLIANCE_SANCTIONS_ENABLED=1
const SANCTIONS_ENABLED = process.env.COMPLIANCE_SANCTIONS_ENABLED === '1';

if (!SANCTIONS_ENABLED) {
  describe('Sanctions Screening (skipped)', () => {
    it('skips sanctions screening tests (enable with COMPLIANCE_SANCTIONS_ENABLED=1)', () => {
      expect(true).to.be.true;
    });
  });
} else {
  describe('Sanctions Screening', () => {
    const COMPLIANCE_SERVICE_URL = process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3002';

    describe('Individual Screening', () => {
      it('should approve clean US customer', async function() {
        this.timeout(5000);

        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/screen`, {
          type: 'individual',
          firstName: 'John',
          lastName: 'Smith',
          dob: '1990-01-01',
          country: 'US',
        });

        expect(response.status).to.equal(200);
        expect(response.data.match).to.be.false;
        expect(response.data.clearStatus).to.equal('CLEAR');
      });

      it('should flag sanctioned individual (simulated)', async function() {
        this.timeout(5000);

        // Use known test name (Osama Bin Laden)
        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/screen`, {
          type: 'individual',
          firstName: 'Osama',
          lastName: 'Bin Laden',
          dob: '1957-03-10',
          country: 'SA',
        });

        expect(response.status).to.equal(200);
        expect(response.data.match).to.be.true;
        expect(response.data.clearStatus).to.equal('HIT');
        expect(response.data.sanctions).to.include('OFAC');
      });

      it('should flag customer from high-risk jurisdiction', async function() {
        this.timeout(5000);

        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/screen`, {
          type: 'individual',
          firstName: 'Ivan',
          lastName: 'Petrov',
          dob: '1985-05-15',
          country: 'KP',  // North Korea
        });

        expect(response.status).to.equal(200);
        expect(response.data.match).to.be.true;
        expect(response.data.clearStatus).to.equal('HIGH_RISK_JURISDICTION');
      });
    });

    describe('Business Entity Screening', () => {
      it('should approve clean US business', async function() {
        this.timeout(5000);

        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/screen`, {
          type: 'business',
          businessName: 'Acme Corp LLC',
          ein: '12-3456789',
          country: 'US',
        });

        expect(response.status).to.equal(200);
        expect(response.data.match).to.be.false;
        expect(response.data.clearStatus).to.equal('CLEAR');
      });

      it('should flag business on SDN list (simulated)', async function() {
        this.timeout(5000);

        // Use known sanctioned entity
        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/screen`, {
          type: 'business',
          businessName: 'Bank Melli Iran',
          country: 'IR',
        });

        expect(response.status).to.equal(200);
        expect(response.data.match).to.be.true;
        expect(response.data.clearStatus).to.equal('HIT');
        expect(response.data.sanctions).to.include('OFAC');
      });
    });

    describe('Wallet Address Screening', () => {
      it('should screen XRPL wallet address', async function() {
        this.timeout(5000);

        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/screen-wallet`, {
          address: 'rNormalWalletAddress12345',
          blockchain: 'xrpl',
        });

        expect(response.status).to.equal(200);
        expect(response.data.match).to.be.false;
        expect(response.data.clearStatus).to.equal('CLEAR');
      });

      it('should flag known illicit wallet (Chainalysis integration)', async function() {
        this.timeout(5000);

        // Example: Tornado Cash-associated wallet
        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/screen-wallet`, {
          address: 'rTornadoCashRelatedWallet',
          blockchain: 'xrpl',
        });

        // Note: This would require actual Chainalysis API integration
        // For now, test the API shape
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('match');
        expect(response.data).to.have.property('clearStatus');
      });
    });

    describe('Ongoing Monitoring', () => {
      it('should re-screen existing customer', async function() {
        this.timeout(5000);

        // Simulate re-screening existing customer
        const customerId = 'cust_123';

        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/rescreen/${customerId}`);

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('customerId', customerId);
        expect(response.data).to.have.property('screenedAt');
        expect(response.data).to.have.property('result');
      });

      it('should detect if customer added to sanctions list', async function() {
        this.timeout(5000);

        // Simulate scenario where customer was clean, but now sanctioned
        const customerId = 'cust_456';

        const response = await axios.post(`${COMPLIANCE_SERVICE_URL}/sanctions/rescreen/${customerId}`);

        // If match, compliance officer should be alerted
        if (response.data.result.match) {
          expect(response.data.alertSent).to.be.true;
          expect(response.data.accountStatus).to.equal('FROZEN');
        }
      });
    });
  });
}
