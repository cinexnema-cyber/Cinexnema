const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

async function createTestUsers() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/xnema";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("🔗 Conectado ao MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");

    // Verificar se já existem usuários
    const existingUsers = await usersCollection.countDocuments();
    console.log(`📊 Usuários existentes: ${existingUsers}`);

    // 1. Criar Assinante de teste
    const hashedPassword = await bcrypt.hash("123456", 10);

    const subscriberExists = await usersCollection.findOne({
      email: "assinante@teste.com",
    });
    if (!subscriberExists) {
      await usersCollection.insertOne({
        email: "assinante@teste.com",
        password: hashedPassword,
        nome: "Assinante Teste",
        role: "subscriber",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
        subscriptionPlan: "monthly",
        subscriptionStart: new Date(),
        watchHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Usuário Assinante criado: assinante@teste.com / 123456");
    } else {
      console.log("ℹ️ Usuário Assinante já existe");
    }

    // 2. Criar Criador de teste
    const creatorExists = await usersCollection.findOne({
      email: "criador@teste.com",
    });
    if (!creatorExists) {
      await usersCollection.insertOne({
        email: "criador@teste.com",
        password: hashedPassword,
        nome: "Criador Teste",
        role: "creator",
        isPremium: false,
        subscriptionStatus: "pending",
        assinante: false,
        creatorProfile: {
          bio: "Criador de conteúdo de teste",
          portfolio: "https://portfolio-teste.com",
          status: "approved",
          totalVideos: 0,
          approvedVideos: 0,
          rejectedVideos: 0,
          totalViews: 0,
          monthlyEarnings: 0,
          affiliateEarnings: 0,
          referralCount: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Usuário Criador criado: criador@teste.com / 123456");
    } else {
      console.log("ℹ️ Usuário Criador já existe");
    }

    // 3. Criar Admin de teste
    const adminExists = await usersCollection.findOne({
      email: "admin@teste.com",
    });
    if (!adminExists) {
      await usersCollection.insertOne({
        email: "admin@teste.com",
        password: hashedPassword,
        nome: "Admin Teste",
        role: "admin",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Usuário Admin criado: admin@teste.com / 123456");
    } else {
      console.log("ℹ️ Usuário Admin já existe");
    }

    console.log("\n🎯 USUÁRIOS DE TESTE DISPONÍVEIS:");
    console.log("👤 ASSINANTE: assinante@teste.com / 123456");
    console.log("🎨 CRIADOR: criador@teste.com / 123456");
    console.log("👑 ADMIN: admin@teste.com / 123456");

    const totalUsers = await usersCollection.countDocuments();
    console.log(`\n📊 Total de usuários no banco: ${totalUsers}`);
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await client.close();
    console.log("🔌 Conexão fechada");
  }
}

createTestUsers();
