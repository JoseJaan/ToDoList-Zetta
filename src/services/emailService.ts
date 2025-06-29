import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.RESET_PASSWORD_URL || 'http://localhost:3001'}/#reset?token=${token}`;
    
    const mailOptions = {
      from: `"Zetta ToDoList" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de Senha',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Redefinição de Senha</h2>
          
          <p>Olá, <strong>${userName}</strong>!</p>
          
          <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p>Ou copie e cole o link abaixo em seu navegador:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Importante:</strong> Este link é válido por apenas 1 hora por questões de segurança.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Se você não solicitou esta redefinição, pode ignorar este email com segurança.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este é um email automático, não responda.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de redefinição enviado para: ${email}`);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email de redefinição');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Conexão com o servidor de email estabelecida');
      return true;
    } catch (error) {
      console.error('Erro na conexão com o servidor de email:', error);
      return false;
    }
  }
}

export default new EmailService();