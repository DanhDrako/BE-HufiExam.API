export class ServerCheckTemplate {
    static newInstance() { return new ServerCheckTemplate() }
  
    public getTemplate(
      email: string = 'replace@gmail.com',
      server: string = 'myhufier.com',
      titleT: string = 'Title',
      descT: string = 'decription',
    ) {
      return `
      <div
    style="margin: auto; background-color: #fff; width: 850px; min-height: 30px; border-radius: 3px; border: none;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
    <div style="margin: auto;border: 1px solid #333;margin: 22px 32px;padding: 0 20px;border-radius: 3px;">
      <h3 style="font-weight: 600; font-size: 30px;margin-bottom: 5px;margin-top: 25px;font-size: 35px;">${titleT}</h3>
      <h4 style="margin-top: 60px;">Server Check: <span style="font-weight: 500;">${server}</span></h4>
      <h4 style="margin-top: 60px;">Email Address: <span style="font-weight: 500;">${email}</span></h4>
      <p style="margin-top: 60px;font-size: 24px;align-items: center; color: rgb(35, 189, 137)">${descT}</p>
    </div>
  </div>
      `
    }
  }