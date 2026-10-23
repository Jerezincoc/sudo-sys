namespace SudoSys.SharedKernel;

/// <summary>Marca o assembly do SharedKernel para testes de arquitetura (OD-004, OD-013).</summary>
public static class SharedKernelAssembly
{
    public static System.Reflection.Assembly Assembly => typeof(SharedKernelAssembly).Assembly;
}
