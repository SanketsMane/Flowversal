import speakeasy from 'speakeasy';
import crypto from 'crypto';
import { MfaModel } from '../models/mfa.model';

export class MfaService {
  generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({ length: 32 });
    return { ascii: secret.ascii, otpauth_url: secret.otpauth_url, base32: secret.base32 };
  }

  async enableMfa(userId: string, base32Secret: string) {
    const backupCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString('hex'));
    await MfaModel.findOneAndUpdate(
      { userId },
      { secret: base32Secret, enabled: true, backupCodes },
      { upsert: true }
    );
    return backupCodes;
  }

  async disableMfa(userId: string) {
    await MfaModel.findOneAndUpdate({ userId }, { enabled: false });
  }

  async verifyToken(userId: string, token: string) {
    const record = await MfaModel.findOne({ userId, enabled: true });
    if (!record) return false;
    return speakeasy.totp.verify({
      secret: record.secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  async consumeBackupCode(userId: string, code: string) {
    const record = await MfaModel.findOne({ userId, enabled: true });
    if (!record) return false;
    if (!record.backupCodes.includes(code)) return false;
    record.backupCodes = record.backupCodes.filter((c) => c !== code);
    await record.save();
    return true;
  }
}

export const mfaService = new MfaService();

