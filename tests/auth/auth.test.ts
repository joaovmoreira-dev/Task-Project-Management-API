describe("Setup de testes", () => {
    it("deve estar funcionando", () => {
        expect(1 + 1).toBe(2);
    });

    it("deve user o ambiente de teste", () => {
        expect(process.env.NODE_ENV).toBe("test");
    });

    it("deve ter JWT_SECRET configurado", () => {
        expect(process.env.JWT_SECRET).toBeDefined();
    });
});