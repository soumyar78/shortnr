class UserMailer < ApplicationMailer
  def password_reset(user, token)
    @user = user
    @token = token
    
    frontend_host = ENV.fetch('FRONTEND_URL', 'localhost:5173')
    # strip protocol if user prepended it
    frontend_host = frontend_host.gsub(%r{^https?://}, '')
    
    protocol = ENV.fetch('FRONTEND_URL', 'localhost:5173').start_with?('https') ? 'https' : 'http'
    @reset_url = "#{protocol}://#{frontend_host}/reset-password?token=#{token}"

    mail(to: @user.email, subject: "Reset your Shortnr Password")
  end
end
