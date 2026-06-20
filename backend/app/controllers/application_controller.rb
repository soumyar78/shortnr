class ApplicationController < ActionController::API
  before_action :authenticate_request

  attr_reader :current_user

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity

  private

  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header.present?
    
    begin
      decoded = JsonWebToken.decode(header)
      @current_user = User.find(decoded[:user_id]) if decoded
    rescue ActiveRecord::RecordNotFound
      # user deleted
    rescue JWT::DecodeError
      # invalid token
    end

    render_unauthorized unless @current_user
  end

  def authenticate_request_optional
    header = request.headers['Authorization']
    header = header.split(' ').last if header.present?
    
    begin
      decoded = JsonWebToken.decode(header)
      @current_user = User.find(decoded[:user_id]) if decoded
    rescue => e
      @current_user = nil
    end
  end

  def render_unauthorized
    render json: { error: 'Not Authorized' }, status: :unauthorized
  end

  def render_not_found(exception)
    render json: { error: exception.message }, status: :not_found
  end

  def render_unprocessable_entity(exception)
    render json: { error: exception.record.errors.full_messages.join(', ') }, status: :unprocessable_entity
  end

  def render_error(message, status = :bad_request)
    render json: { error: message }, status: status
  end
end
