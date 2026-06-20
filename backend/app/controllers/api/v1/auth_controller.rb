class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:signup, :login]

  # POST /api/v1/auth/signup
  def signup
    user = User.new(signup_params)
    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.bio_profile.username
        }
      }, status: :created
    else
      render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/auth/login
  def login
    user = User.find_by(email: params[:email].to_s.downcase)
    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.bio_profile&.username
        }
      }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end


  private

  def signup_params
    params.permit(:name, :email, :password)
  end
end
