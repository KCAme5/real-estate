const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface ApiError {
    message: string;
    status: number;
}

class ApiClient {
    private accessToken: string | null = null;
    private onLogout: (() => void) | null = null;

    setAccessToken(token: string | null) {
        this.accessToken = token;
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    setLogoutHandler(handler: () => void) {
        this.onLogout = handler;
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
            credentials: 'include',
            ...options,
        };

        try {
            let response = await fetch(url, config);

            if (
                response.status === 401 &&
                !endpoint.includes('/auth/login') &&
                !endpoint.includes('/auth/register')
            ) {
                try {
                    const refreshResp = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                    if (refreshResp.ok) {
                        // Token is now set via httpOnly cookie by the backend
                        // Retry the original request with the new cookie
                        response = await fetch(url, config);
                    } else {
                        if (this.onLogout) this.onLogout();
                        throw new Error('Session expired');
                    }
                } catch (e) {
                    if (this.onLogout) this.onLogout();
                    throw e;
                }
            }

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
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