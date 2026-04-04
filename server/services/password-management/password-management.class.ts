import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { BadRequest, NotAuthenticated } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';

type PasswordManagementAction =
  | 'forgot-password'
  | 'reset-password'
  | 'change-password';

type PasswordManagementData = {
  action: PasswordManagementAction;
  email?: string;
  token?: string;
  password?: string;
  currentPassword?: string;
  newPassword?: string;
};

const MIN_PASSWORD_LENGTH = 4;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

const hashResetToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const buildSuccessMessage =
  'If that email exists, a password reset instruction has been generated.';

export class PasswordManagement {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async create(data: PasswordManagementData, params: Params) {
    const action = data?.action;

    if (!action) {
      throw new BadRequest('Action is required.');
    }

    if (action === 'forgot-password') {
      return this.handleForgotPassword(data);
    }

    if (action === 'reset-password') {
      return this.handleResetPassword(data);
    }

    if (action === 'change-password') {
      return this.handleChangePassword(data, params);
    }

    throw new BadRequest('Unsupported password management action.');
  }

  private async handleForgotPassword(data: PasswordManagementData) {
    const email = data.email?.trim().toLowerCase();

    if (!email) {
      throw new BadRequest('Email is required.');
    }

    const knex = this.app.get('knexClient');
    const user = await knex('users').where({ email }).first();

    if (!user) {
      return { message: buildSuccessMessage };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashResetToken(resetToken);
    const resetExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await knex('users').where({ id: user.id }).update({
      reset_password_token: resetTokenHash,
      reset_password_expires_at: resetExpiresAt,
    });

    const response: Record<string, string> = {
      message: buildSuccessMessage,
    };

    if (this.app.get('env') !== 'production') {
      response.resetToken = resetToken;
    }

    return response;
  }

  private async handleResetPassword(data: PasswordManagementData) {
    const email = data.email?.trim().toLowerCase();
    const token = data.token?.trim();
    const password = data.password;

    if (!email || !token || !password) {
      throw new BadRequest('Email, token and password are required.');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequest(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
    }

    const knex = this.app.get('knexClient');
    const user = await knex('users').where({ email }).first();

    if (!user?.reset_password_token || !user?.reset_password_expires_at) {
      throw new BadRequest('Invalid email or reset token.');
    }

    const resetExpiresAt = new Date(user.reset_password_expires_at);
    if (Number.isNaN(resetExpiresAt.getTime()) || resetExpiresAt < new Date()) {
      throw new BadRequest('Reset token has expired.');
    }

    const tokenHash = hashResetToken(token);
    if (tokenHash !== user.reset_password_token) {
      throw new BadRequest('Invalid email or reset token.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await knex('users').where({ id: user.id }).update({
      password: passwordHash,
      reset_password_token: null,
      reset_password_expires_at: null,
    });

    return { message: 'Password has been reset successfully.' };
  }

  private async handleChangePassword(
    data: PasswordManagementData,
    params: Params,
  ) {
    if (!params.user?.id) {
      throw new NotAuthenticated('You need to be authenticated.');
    }

    const currentPassword = data.currentPassword;
    const newPassword = data.newPassword;

    if (!currentPassword || !newPassword) {
      throw new BadRequest('Current password and new password are required.');
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequest(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
    }

    if (currentPassword === newPassword) {
      throw new BadRequest(
        'New password must be different from current password.',
      );
    }

    const knex = this.app.get('knexClient');
    const user = await knex('users').where({ id: params.user.id }).first();

    if (!user?.password) {
      throw new BadRequest('User password is not configured.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequest('Current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await knex('users').where({ id: user.id }).update({
      password: passwordHash,
    });

    return { message: 'Password changed successfully.' };
  }
}
