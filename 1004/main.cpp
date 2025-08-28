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
    if (N == 0)
      std::cout << "1 0" << std::endl;
    else if (N == 1)
      std::cout << "0 1" << std::endl;
    else
    {
      TwoValues result = fibo(N);
      std::cout << result.a << " " << result.b << std::endl;
    }
  }
  return 0;
}

TwoValues fibo(int n)
{
  TwoValues result;
  int n1 = 1, n2 = 1;

  for (int i = 2; i < n; i++)
  {
    int temp = n1;
    n1 = n2;
    n2 = temp + n1;
  }

  result.a = n1;
  result.b = n2;
  return result;
}