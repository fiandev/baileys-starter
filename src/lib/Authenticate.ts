import { prisma } from "../lib/prisma";

type AuthenticateStoreParams = {
    phone: string;
    name: string;
    age: number;
};

export default class Authenticate {
    public async store({ phone, name, age }: AuthenticateStoreParams) {
        await prisma.user.upsert({
            where: { phone },
            create: { phone, name, age },
            update: { name, age },
        });
    }

    public async remove(phone: string) {
        await prisma.user.delete({ where: { phone } }).catch(() => {});
    }

    public async check(phone: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { phone } });
        return !!user;
    }

    public async getUser(phone: string) {
        return await prisma.user.findUnique({ where: { phone } });
    }

    public async update(phone: string, data: any) {
        await prisma.user.update({
            where: { phone },
            data,
        });
    }

    public async isPremium(phone: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { phone } });
        return user?.isPremium || false;
    }

    public async setPremium(phone: string, isPremium: boolean) {
        await prisma.user.update({
            where: { phone },
            data: { isPremium },
        });
    }
}
