const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface ApiError {
    message: string;
    status: number;
}

class ApiClient {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private onLogout: (() => void) | null = null;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    constructor() {
        // Load tokens from localStorage on initialization
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
        }
    }

    setAccessToken(token: string | null) {
        this.accessToken = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('accessToken', token);
            } else {
                localStorage.removeItem('accessToken');
            }
        }
    }

    setRefreshToken(token: string | null) {
        this.refreshToken = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('refreshToken', token);
            } else {
                localStorage.removeItem('refreshToken');
            }
        }
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    setLogoutHandler(handler: () => void) {
        this.onLogout = handler;
    }

    private processQueue(error: any, token: string | null = null) {
        this.failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        this.failedQueue = [];
    }

    private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const isForm = options.body && (options.body as any) instanceof FormData;
        const headers: Record<string, string> = {
            ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
            ...(options.headers as Record<string, string>),
        };

        if (!isForm) headers['Content-Type'] = 'application/json';

        const config: RequestInit = {
            headers,
            ...options,
        };

        try {
            let response = await fetch(url, config);

            if (
                response.status === 401 &&
                !endpoint.includes('/auth/login') &&
                !endpoint.includes('/auth/register')
            ) {
                if (this.isRefreshing) {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                        this.failedQueue.push({ resolve, reject });
                    }).then(() => {
                        return this.request<T>(endpoint, options);
                    });
                }

                this.isRefreshing = true;

                try {
                    // Try to refresh the token
                    const refreshResp = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            refresh: this.refreshToken,
                        }),
                    });

                    if (refreshResp.ok) {
                        const refreshData = await refreshResp.json();
                        // Update tokens
                        this.setAccessToken(refreshData.access);
                        if (refreshData.refresh) {
                            this.setRefreshToken(refreshData.refresh);
                        }
                        // Retry the original request with the new token
                        const newHeaders = {
                            ...headers,
                            Authorization: `Bearer ${refreshData.access}`,
                        };
                        response = await fetch(url, { ...config, headers: newHeaders });
                        this.processQueue(null, refreshData.access);
                    } else {
                        // Refresh failed, trigger logout
                        this.processQueue(new Error('Session expired'), null);
                        if (this.onLogout) this.onLogout();
                        throw new Error('Session expired');
                    }
                } catch (e) {
                    this.processQueue(e, null);
                    if (this.onLogout) this.onLogout();
                    throw e;
                } finally {
                    this.isRefreshing = false;
                }
            }

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                let fieldErrors: Record<string, any> = {};
                try {
                    const errorData = await response.json();

                    // Handle DRF validation errors (field errors dict)
                    if (typeof errorData === 'object' && !Array.isArray(errorData)) {
                        if (errorData.detail) {
                            errorMessage = errorData.detail;
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        } else {
                            // Collect field errors
                            for (const [field, errors] of Object.entries(errorData)) {
                                if (Array.isArray(errors)) {
                                    fieldErrors[field] = errors.join(', ');
                                } else if (typeof errors === 'string') {
                                    fieldErrors[field] = errors;
                                }
                            }
                            if (Object.keys(fieldErrors).length > 0) {
                                errorMessage = Object.entries(fieldErrors)
                                    .map(([field, error]) => `${field}: ${error}`)
                                    .join('\n');
                            }
                        }
                    }
                } catch {
                    // non-JSON error body — use default message
                }
                const error: ApiError = { message: errorMessage, status: response.status };
                throw error;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return (await response.json()) as T;
            }

            return null as T;
        } catch (error: any) {
            if (error.status !== undefined) throw error;
            throw {
                message: error.message || 'Network error: Unable to connect to server',
                status: 0,
            };
        }
    }

    async get<T = any>(
        endpoint: string,
        options: RequestInit & { params?: Record<string, any> } = {},
    ): Promise<T> {
        let url = endpoint;
        if (options.params) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
            delete options.params;
        }
        return this.request<T>(url, { method: 'GET', ...options });
    }

    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        const isForm = data instanceof FormData;
        return this.request<T>(endpoint, {
            method: 'POST',
            body: isForm ? data : JSON.stringify(data),
        });
    }

    async put<T = any>(endpoint: string, data?: any): Promise<T> {
        const isForm = data instanceof FormData;
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: isForm ? data : JSON.stringify(data),
        });
    }

    async patch<T = any>(endpoint: string, data?: any): Promise<T> {
        const isForm = data instanceof FormData;
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: isForm ? data : JSON.stringify(data),
        });
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();