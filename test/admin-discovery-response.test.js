'use strict';
const { expect } = require('chai');
const { createAdminDiscoveryResponse } = require('../lib/adminDiscoveryResponse');
describe('Admin printer discovery response contract (copyDialog, no config change)',()=>{
 it('returns only a copyDialog: no native data, no result, no saveConfig',()=>{
  const response=createAdminDiscoveryResponse([{name:'X1 Carbon',ip:'192.168.178.60',serial:'ABC123',model:'X1C'}]);
  expect(response).to.have.keys(['copyDialog']);expect(response.copyDialog).to.have.keys(['title','type','text']);
  expect(response).not.to.have.property('native');expect(response).not.to.have.property('result');expect(response).not.to.have.property('saveConfig');
  for(const value of ['Name:','X1 Carbon','192.168.178.60','ABC123','X1C'])expect(response.copyDialog.text).to.include(value);
 });
 it('marks configured printers without leaking access tokens',()=>{
  const discovered=[{name:'Existing',ip:'192.168.1.10',serial:'abc123',model:'X1C',Password:'broadcast-token'},{name:'New',ip:'192.168.1.11',serial:'NEW456',model:'P1S'}];
  const text=createAdminDiscoveryResponse(discovered,new Set(['ABC123'])).copyDialog.text;
  expect(text.match(/Already configured/g)).to.have.length(1);expect(text.indexOf('Already configured')).to.be.lessThan(text.indexOf('Printer 2'));expect(text).not.to.include('broadcast-token');
 });
 it('handles empty discovery and absent values',()=>{
  expect(createAdminDiscoveryResponse([]).copyDialog.text).to.include('No BambuLab printers found');
  const text=createAdminDiscoveryResponse([{ip:'10.0.0.2'}]).copyDialog.text;expect(text).to.include('10.0.0.2');expect(text).not.to.include('undefined');
 });
 it('supports German and English fallback',()=>{
  expect(createAdminDiscoveryResponse([],new Set(),'de').copyDialog.title).to.equal('Gefundene BambuLab-Drucker');
  expect(createAdminDiscoveryResponse([],new Set(),'fr').copyDialog.title).to.equal('Discovered BambuLab printers');
 });
 it('does not mutate discovered records',()=>{
  const printers=[{name:'Printer',serial:'SN',ip:'192.168.1.20'}],before=JSON.parse(JSON.stringify(printers));createAdminDiscoveryResponse(printers);expect(printers).to.deep.equal(before);
 });
});
