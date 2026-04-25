import { prisma } from '@/lib/prisma';

export const SalesService = {
  async findLeadByEmail(email: string) {
    return await prisma.lead.findFirst({
      where: { email },
    });
  },

  async captureLead(email: string, whatsapp?: string) {
    const existing = await this.findLeadByEmail(email);
    if (existing) return existing;
    return await prisma.lead.create({
      data: { email, whatsapp },
    });
  },

  async registerCartAbandonment(email: string, items: any[]) {
    return await prisma.cartAbandonment.create({
      data: {
        email,
        items, // Guardamos los items en formato JSON
        status: 'PENDING',
      },
    });
  },

  async markAsRecovered(abandonmentId: string) {
    return await prisma.cartAbandonment.update({
      where: { id: abandonmentId },
      data: { status: 'RECOVERED' },
    });
  }
};
