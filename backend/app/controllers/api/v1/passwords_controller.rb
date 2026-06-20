class Api::V1::PasswordsController < ApplicationController
  skip_before_action :authenticate_request, only: [:forgot, :reset]

  # POST /api/v1/passwords/forgot
  def forgot
    email = params[:email].to_s.downcase.strip
    user = User.find_by(email: email)

    if user.present?
      token = user.generate_token_for(:password_reset)
      UserMailer.password_reset(user, token).deliver_now
    end

    # Return same generic response to prevent email enumeration
    render json: {
      message: "If that email address exists in our system, we have sent instructions to reset your password."
    }, status: :ok
  end

  # POST /api/v1/passwords/reset
  def reset
    token = params[:token].to_s
    password = params[:password].to_s

    if password.blank? || password.length < 6
      render json: { error: "Password must be at least 6 characters long." }, status: :unprocessable_entity
      return
    end

    user = User.find_by_token_for(:password_reset, token)

    if user.present?
      if user.update(password: password)
        # Rails 8 generates_token_for relies on password_salt by default.
        # Since the password updated, the salt changed, which automatically
        # invalidates the token.
        render json: { message: "Your password has been reset successfully. Please log in with your new password." }, status: :ok
      else
        render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
      end
    else
      render json: { error: "The reset link is invalid or has expired." }, status: :unprocessable_entity
    end
  end
end
