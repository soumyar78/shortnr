class Rack::Attack
  # Throttle all requests by IP (e.g. 100 requests per minute)
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # Throttle signups by IP (e.g. 5 signups per minute per IP)
  throttle('signup/ip', limit: 5, period: 1.minute) do |req|
    if req.path == '/api/v1/auth/signup' && req.post?
      req.ip
    end
  end

  # Throttle logins by IP (e.g. 10 logins per minute per IP)
  throttle('login/ip', limit: 10, period: 1.minute) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      req.ip
    end
  end

  # Throttle password resets by IP
  throttle('password_reset/ip', limit: 3, period: 1.hour) do |req|
    if req.path == '/api/v1/passwords/forgot' && req.post?
      req.ip
    end
  end

  # Custom Response for throttled requests
  self.throttled_responder = lambda do |request_env|
    [
      429,
      { 'Content-Type' => 'application/json' },
      [{ error: 'Rate limit exceeded. Please try again later.' }.to_json]
    ]
  end
end
