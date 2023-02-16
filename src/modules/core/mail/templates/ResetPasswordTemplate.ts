export class ResetPasswordTemplate {
  static newInstance() { return new ResetPasswordTemplate() }

  public getTemplate(
    email: string = 'replace@gmail.com',
    resetLink: string = 'active link',
    homeLink: string = 'home link',
  ) {
    return `
    <div
  style="margin: auto; background-color: #fff; width: 850px; min-height: 30px; border-radius: 3px; border: none;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
  <div style="margin: auto;border: 1px solid #333;margin: 22px 32px;padding: 0 20px;border-radius: 3px;">
    <h3 style="font-weight: 600; font-size: 30px;margin-bottom: 5px;margin-top: 25px;font-size: 35px;">Khôi phục mật khẩu
      khoản của bạn</h3>
    <a href="${resetLink}" style="font-size: 15px;font-weight: 600; text-decoration: none; color: rgb(39, 58, 226);"></a>
    <h4 style="margin-top: 60px;">Email Address: <span style="font-weight: 500;">${email}</span></h4>
    <Button
      style="width: 230px;height: 40px;font-size: 18px;align-items: center;background-color: rgb(35, 189, 137);border: none;border-radius: 8px;cursor: pointer;">
      <a href="${resetLink}" onMouseOver="this.style.color='black'" onMouseOut="this.style.color='white'"
        style="color: #fff;font-weight: 600;text-decoration: none;">Khôi phục tài khoản</a>
    </Button>
    <div style="display: inline-flex;margin-top: 20px;">
      <p style="margin-right: 100px;"><a href="${homeLink}"
          style="text-decoration: none;color: rgb(39, 58, 226); cursor: pointer;">Bạn đã có tài khoản? đăng nhập tại
          đây</a></p>
      <p>Cảm ơn bạn đã đăng ký tài khoản trên: <a href="${homeLink}" style="text-decoration: none; color: #333; cursor: pointer;">
        hufidoc.online</a></p>
    </div>
  </div>
</div>
    `
  }
}