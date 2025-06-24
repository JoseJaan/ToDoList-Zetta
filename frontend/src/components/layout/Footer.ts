export class Footer {
  render(): string {
    const currentYear = new Date().getFullYear();

    return `
      <footer class="app-footer">
        <div class="container-fluid px-3 px-md-4">
          <div class="row align-items-center">
            <div class="col-12 col-md-6">
              <p class="footer-text mb-0">
                © ${currentYear} ToDo List. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  destroy(): void {
  }
}