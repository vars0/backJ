#include <iostream>

struct TwoValues
{
  int a;
  int b;
};

TwoValues fibo(int n);

int main(int argc, char **argv)
{
  int T;
  std::cin >> T;
  for (int i = 0; i < T; i++)
  {
    int N;
    std::cin >> N;
    TwoValues result = fibo(N);
    std::cout << result.a << " " << result.b << std::endl;
  }
  return 0;
}

TwoValues fibo(int n)
{
  TwoValues result;
  int n1 = 1, n2 = 0;

  for (int i = 0; i < n; i++)
  {
    int temp = n1;
    n1 = n2;
    n2 = temp + n1;
  }

  result.a = n1;
  result.b = n2;
  return result;
}